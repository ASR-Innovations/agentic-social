import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { ProductService } from './services/product.service';
import { IntegrationService } from './services/integration.service';
import { ConversionTrackingService } from './services/conversion-tracking.service';
import { CommerceAnalyticsService } from './services/commerce-analytics.service';
import { ShopifyConnector } from './connectors/shopify.connector';
import { WooCommerceConnector } from './connectors/woocommerce.connector';
import { BigCommerceConnector } from './connectors/bigcommerce.connector';

@Module({
  imports: [PrismaModule],
  controllers: [CommerceController],
  providers: [
    CommerceService,
    ProductService,
    IntegrationService,
    ConversionTrackingService,
    CommerceAnalyticsService,
    ShopifyConnector,
    WooCommerceConnector,
    BigCommerceConnector,
  ],
  exports: [
    CommerceService,
    ProductService,
    IntegrationService,
    ConversionTrackingService,
    CommerceAnalyticsService,
  ],
})
export class CommerceModule {}
