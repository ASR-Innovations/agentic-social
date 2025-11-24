#!/usr/bin/env ts-node

/**
 * Verification script for caching implementation
 * Tests all cache layers, invalidation strategies, and CDN integration
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CacheService } from '../src/cache/services/cache.service';
import { CacheWarmingService } from '../src/cache/services/cache-warming.service';
import { CacheInvalidationService } from '../src/cache/services/cache-invalidation.service';
import { CdnService } from '../src/cache/services/cdn.service';
import { CacheLayer } from '../src/cache/interfaces/cache.interface';

async function verifyCache() {
  console.log('🔍 Starting Cache Implementation Verification...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const cacheService = app.get(CacheService);
  const warmingService = app.get(CacheWarmingService);
  const invalidationService = app.get(CacheInvalidationService);
  const cdnService = app.get(CdnService);

  let passed = 0;
  let failed = 0;

  // Test 1: L1 Cache (In-Memory)
  console.log('📝 Test 1: L1 Cache (In-Memory)');
  try {
    await cacheService.set('test:l1', { data: 'test' }, {
      ttl: 60,
      layer: CacheLayer.L1,
    });
    const result = await cacheService.get('test:l1', { layer: CacheLayer.L1 });
    if (result && result.data === 'test') {
      console.log('✅ L1 Cache working\n');
      passed++;
    } else {
      console.log('❌ L1 Cache failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ L1 Cache error:', error.message, '\n');
    failed++;
  }

  // Test 2: L2 Cache (Redis Short-Term)
  console.log('📝 Test 2: L2 Cache (Redis Short-Term)');
  try {
    await cacheService.set('test:l2', { data: 'test' }, {
      ttl: 300,
      layer: CacheLayer.L2,
    });
    const result = await cacheService.get('test:l2', { layer: CacheLayer.L2 });
    if (result && result.data === 'test') {
      console.log('✅ L2 Cache working\n');
      passed++;
    } else {
      console.log('❌ L2 Cache failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ L2 Cache error:', error.message, '\n');
    failed++;
  }

  // Test 3: L3 Cache (Redis Long-Term)
  console.log('📝 Test 3: L3 Cache (Redis Long-Term)');
  try {
    await cacheService.set('test:l3', { data: 'test' }, {
      ttl: 3600,
      layer: CacheLayer.L3,
    });
    const result = await cacheService.get('test:l3', { layer: CacheLayer.L3 });
    if (result && result.data === 'test') {
      console.log('✅ L3 Cache working\n');
      passed++;
    } else {
      console.log('❌ L3 Cache failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ L3 Cache error:', error.message, '\n');
    failed++;
  }

  // Test 4: Cache-Aside Pattern
  console.log('📝 Test 4: Cache-Aside Pattern (getOrSet)');
  try {
    let fetchCalled = false;
    const result1 = await cacheService.getOrSet(
      'test:cache-aside',
      async () => {
        fetchCalled = true;
        return { data: 'fetched' };
      },
      { ttl: 300, layer: CacheLayer.L2 }
    );

    const result2 = await cacheService.getOrSet(
      'test:cache-aside',
      async () => {
        throw new Error('Should not be called');
      },
      { ttl: 300, layer: CacheLayer.L2 }
    );

    if (fetchCalled && result1.data === 'fetched' && result2.data === 'fetched') {
      console.log('✅ Cache-Aside Pattern working\n');
      passed++;
    } else {
      console.log('❌ Cache-Aside Pattern failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Cache-Aside Pattern error:', error.message, '\n');
    failed++;
  }

  // Test 5: Tag-Based Caching
  console.log('📝 Test 5: Tag-Based Caching');
  try {
    await cacheService.set('test:tag1', { data: 'test1' }, {
      ttl: 300,
      layer: CacheLayer.L2,
      tags: ['test-tag', 'workspace:123'],
    });
    await cacheService.set('test:tag2', { data: 'test2' }, {
      ttl: 300,
      layer: CacheLayer.L2,
      tags: ['test-tag', 'workspace:456'],
    });

    const result1 = await cacheService.get('test:tag1', { layer: CacheLayer.L2 });
    const result2 = await cacheService.get('test:tag2', { layer: CacheLayer.L2 });

    if (result1 && result2) {
      console.log('✅ Tag-Based Caching working\n');
      passed++;
    } else {
      console.log('❌ Tag-Based Caching failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Tag-Based Caching error:', error.message, '\n');
    failed++;
  }

  // Test 6: Tag-Based Invalidation
  console.log('📝 Test 6: Tag-Based Invalidation');
  try {
    await cacheService.set('test:invalidate1', { data: 'test1' }, {
      ttl: 300,
      layer: CacheLayer.L2,
      tags: ['invalidate-test'],
    });
    await cacheService.set('test:invalidate2', { data: 'test2' }, {
      ttl: 300,
      layer: CacheLayer.L2,
      tags: ['invalidate-test'],
    });

    await cacheService.deleteByTags(['invalidate-test']);

    const result1 = await cacheService.get('test:invalidate1', { layer: CacheLayer.L2 });
    const result2 = await cacheService.get('test:invalidate2', { layer: CacheLayer.L2 });

    if (!result1 && !result2) {
      console.log('✅ Tag-Based Invalidation working\n');
      passed++;
    } else {
      console.log('❌ Tag-Based Invalidation failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Tag-Based Invalidation error:', error.message, '\n');
    failed++;
  }

  // Test 7: Pattern-Based Invalidation
  console.log('📝 Test 7: Pattern-Based Invalidation');
  try {
    await cacheService.set('pattern:test:1', { data: 'test1' }, {
      ttl: 300,
      layer: CacheLayer.L2,
    });
    await cacheService.set('pattern:test:2', { data: 'test2' }, {
      ttl: 300,
      layer: CacheLayer.L2,
    });

    await cacheService.deleteByPattern('pattern:test:*', CacheLayer.L2);

    const result1 = await cacheService.get('pattern:test:1', { layer: CacheLayer.L2 });
    const result2 = await cacheService.get('pattern:test:2', { layer: CacheLayer.L2 });

    if (!result1 && !result2) {
      console.log('✅ Pattern-Based Invalidation working\n');
      passed++;
    } else {
      console.log('❌ Pattern-Based Invalidation failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Pattern-Based Invalidation error:', error.message, '\n');
    failed++;
  }

  // Test 8: Compression
  console.log('📝 Test 8: Compression for Large Data');
  try {
    const largeData = {
      data: new Array(1000).fill('test data string that is quite long'),
    };
    await cacheService.set('test:compression', largeData, {
      ttl: 300,
      layer: CacheLayer.L2,
      compress: true,
    });
    const result = await cacheService.get('test:compression', {
      layer: CacheLayer.L2,
      compress: true,
    });

    if (result && result.data.length === 1000) {
      console.log('✅ Compression working\n');
      passed++;
    } else {
      console.log('❌ Compression failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Compression error:', error.message, '\n');
    failed++;
  }

  // Test 9: Cache Statistics
  console.log('📝 Test 9: Cache Statistics');
  try {
    const stats = await cacheService.getStats();
    if (stats && stats.length > 0) {
      console.log('✅ Cache Statistics working');
      console.log('   Cache Layers:', stats.length);
      stats.forEach((stat) => {
        console.log(`   ${stat.layer}: ${stat.size} keys, ${stat.hitRate * 100}% hit rate`);
      });
      console.log('');
      passed++;
    } else {
      console.log('❌ Cache Statistics failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Cache Statistics error:', error.message, '\n');
    failed++;
  }

  // Test 10: Cache Warming Service
  console.log('📝 Test 10: Cache Warming Service');
  try {
    warmingService.registerWarmingConfig({
      key: 'test:warming',
      fetchFunction: async () => ({ data: 'warmed' }),
      ttl: 300,
      layer: CacheLayer.L2,
    });

    await warmingService.warmCache('test:warming');

    const result = await cacheService.get('test:warming', { layer: CacheLayer.L2 });
    if (result && result.data === 'warmed') {
      console.log('✅ Cache Warming working\n');
      passed++;
    } else {
      console.log('❌ Cache Warming failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Cache Warming error:', error.message, '\n');
    failed++;
  }

  // Test 11: Invalidation Service
  console.log('📝 Test 11: Invalidation Service');
  try {
    await cacheService.set('post:123', { data: 'post' }, {
      ttl: 300,
      layer: CacheLayer.L2,
    });
    await cacheService.set('posts:workspace:123:list', { data: 'list' }, {
      ttl: 300,
      layer: CacheLayer.L2,
    });

    await invalidationService.invalidatePostCache('123', '123');

    const result1 = await cacheService.get('post:123', { layer: CacheLayer.L2 });
    const result2 = await cacheService.get('posts:workspace:123:list', { layer: CacheLayer.L2 });

    if (!result1 && !result2) {
      console.log('✅ Invalidation Service working\n');
      passed++;
    } else {
      console.log('❌ Invalidation Service failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ Invalidation Service error:', error.message, '\n');
    failed++;
  }

  // Test 12: CDN Service
  console.log('📝 Test 12: CDN Service');
  try {
    const cdnUrl = cdnService.getCdnUrl('/media/test.jpg');
    const headers = cdnService.getStaticAssetHeaders();

    if (cdnUrl && headers['Cache-Control']) {
      console.log('✅ CDN Service working');
      console.log('   CDN URL:', cdnUrl);
      console.log('   Cache-Control:', headers['Cache-Control']);
      console.log('');
      passed++;
    } else {
      console.log('❌ CDN Service failed\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ CDN Service error:', error.message, '\n');
    failed++;
  }

  // Cleanup
  console.log('🧹 Cleaning up test data...');
  await cacheService.clear();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All cache tests passed! Implementation is complete and working.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  await app.close();
  process.exit(failed === 0 ? 0 : 1);
}

verifyCache().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
