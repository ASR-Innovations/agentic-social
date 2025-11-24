/**
 * Audit Trail System - Demo Script
 * 
 * This script demonstrates the key features of the audit trail system.
 * Run this to see the audit system in action.
 */

import { AuditService } from '../services/audit.service';
import { AuditReportService } from '../services/audit-report.service';
import { AuditAction, AuditSeverity, AuditStatus } from '../dto/audit.dto';

async function demoAuditSystem(
  auditService: AuditService,
  auditReportService: AuditReportService,
) {
  const workspaceId = 'demo-workspace-123';
  const userId = 'demo-user-456';

  console.log('🔍 Audit Trail System Demo\n');

  // ============================================
  // 1. Create Audit Logs
  // ============================================
  console.log('1️⃣ Creating audit logs...');

  // Login success
  const loginLog = await auditService.logLogin(
    workspaceId,
    userId,
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    true,
  );
  console.log('   ✅ Login logged:', loginLog?.id);

  // Post creation
  const postLog = await auditService.logResourceAction(
    workspaceId,
    userId,
    AuditAction.POST_CREATE,
    'post',
    'post-789',
    '192.168.1.100',
    'Mozilla/5.0',
    {
      title: 'My First Post',
      platforms: ['instagram', 'twitter'],
      scheduledAt: new Date(),
    },
  );
  console.log('   ✅ Post creation logged:', postLog?.id);

  // Security event
  const securityLog = await auditService.logSecurityEvent(
    workspaceId,
    userId,
    AuditAction.IP_WHITELIST_ADD,
    '192.168.1.100',
    'Mozilla/5.0',
    {
      ip: '10.0.0.1',
      reason: 'Office network',
    },
    AuditSeverity.WARNING,
  );
  console.log('   ✅ Security event logged:', securityLog?.id);

  // Failed login attempt
  const failedLoginLog = await auditService.logLogin(
    workspaceId,
    'attacker-user',
    '203.0.113.1',
    'curl/7.68.0',
    false,
  );
  console.log('   ✅ Failed login logged:', failedLoginLog?.id);

  console.log('\n');

  // ============================================
  // 2. Verify Integrity
  // ============================================
  console.log('2️⃣ Verifying log integrity...');

  if (loginLog) {
    const isValid = await auditService.verifyIntegrity(loginLog.id);
    console.log(`   ${isValid ? '✅' : '❌'} Login log integrity: ${isValid ? 'VALID' : 'INVALID'}`);
  }

  if (postLog) {
    const isValid = await auditService.verifyIntegrity(postLog.id);
    console.log(`   ${isValid ? '✅' : '❌'} Post log integrity: ${isValid ? 'VALID' : 'INVALID'}`);
  }

  console.log('\n');

  // ============================================
  // 3. Query Audit Logs
  // ============================================
  console.log('3️⃣ Querying audit logs...');

  const allLogs = await auditService.findAll(workspaceId, {
    page: 1,
    limit: 10,
  });
  console.log(`   📊 Total logs: ${allLogs.total}`);
  console.log(`   📄 Current page: ${allLogs.page}/${allLogs.totalPages}`);

  // Query failed logins
  const failedLogins = await auditService.findAll(workspaceId, {
    action: AuditAction.LOGIN_FAILED,
    page: 1,
    limit: 10,
  });
  console.log(`   ⚠️  Failed logins: ${failedLogins.total}`);

  // Query security events
  const securityEvents = await auditService.findAll(workspaceId, {
    severity: AuditSeverity.WARNING,
    page: 1,
    limit: 10,
  });
  console.log(`   🔒 Security events: ${securityEvents.total}`);

  console.log('\n');

  // ============================================
  // 4. Get Statistics
  // ============================================
  console.log('4️⃣ Getting statistics...');

  const stats = await auditService.getStatistics(workspaceId, {});
  console.log(`   📈 Total logs: ${stats.totalLogs}`);
  console.log(`   👥 Unique users: ${stats.topUsers.length}`);
  console.log('   🎯 Top actions:');
  Object.entries(stats.actionCounts)
    .slice(0, 5)
    .forEach(([action, count]) => {
      console.log(`      - ${action}: ${count}`);
    });

  console.log('\n');

  // ============================================
  // 5. Generate Report
  // ============================================
  console.log('5️⃣ Generating audit report...');

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const report = await auditReportService.generateReport(workspaceId, {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    format: 'json',
    includeDetails: false,
  });

  console.log('   📋 Report generated:');
  console.log(`      - Period: ${report.metadata.reportPeriod.start} to ${report.metadata.reportPeriod.end}`);
  console.log(`      - Total logs: ${report.summary.totalLogs}`);
  console.log(`      - Failure rate: ${report.summary.failureRate}`);
  console.log(`      - Top users: ${report.summary.topUsers.length}`);

  console.log('\n');

  // ============================================
  // 6. Generate Compliance Report
  // ============================================
  console.log('6️⃣ Generating compliance report...');

  const complianceReport = await auditReportService.generateComplianceReport(
    workspaceId,
    startDate.toISOString(),
    endDate.toISOString(),
  );

  console.log('   📜 Compliance report generated:');
  console.log(`      - Security events: ${complianceReport.summary.totalSecurityEvents}`);
  console.log(`      - Data access events: ${complianceReport.summary.totalDataAccessEvents}`);
  console.log(`      - Failed attempts: ${complianceReport.summary.totalFailedAttempts}`);
  console.log(`      - Critical events: ${complianceReport.summary.totalCriticalEvents}`);
  console.log('   ✅ SOC 2 Compliance:');
  console.log(`      - Audit trail complete: ${complianceReport.compliance.soc2.auditTrailComplete}`);
  console.log(`      - Retention compliant: ${complianceReport.compliance.soc2.retentionPolicyCompliant}`);
  console.log('   ✅ GDPR Compliance:');
  console.log(`      - Data access logged: ${complianceReport.compliance.gdpr.dataAccessLogged}`);
  console.log(`      - User actions tracked: ${complianceReport.compliance.gdpr.userActionsTracked}`);

  console.log('\n');

  // ============================================
  // 7. Export for SIEM
  // ============================================
  console.log('7️⃣ Exporting for SIEM...');

  const siemExport = await auditReportService.exportForCompliance(
    workspaceId,
    startDate.toISOString(),
    endDate.toISOString(),
    'siem',
  );

  console.log('   📤 SIEM export generated (CEF format)');
  console.log('   Sample:');
  if (typeof siemExport === 'string') {
    const siemLines = siemExport.split('\n');
    console.log(`      ${siemLines[0]?.substring(0, 100)}...`);
  }

  console.log('\n');

  // ============================================
  // 8. Batch Integrity Verification
  // ============================================
  console.log('8️⃣ Batch integrity verification...');

  const batchVerification = await auditService.batchVerifyIntegrity(
    workspaceId,
    startDate,
    endDate,
  );

  console.log('   🔐 Batch verification results:');
  console.log(`      - Total logs: ${batchVerification.totalLogs}`);
  console.log(`      - Valid logs: ${batchVerification.validLogs}`);
  console.log(`      - Invalid logs: ${batchVerification.invalidLogs}`);
  console.log(`      - Integrity: ${batchVerification.integrityPercentage.toFixed(2)}%`);

  console.log('\n');
  console.log('✨ Demo complete!\n');
}

// Export for use in tests or scripts
export { demoAuditSystem };

// Example usage:
// const auditService = new AuditService(prismaService);
// const auditReportService = new AuditReportService(prismaService);
// await demoAuditSystem(auditService, auditReportService);
