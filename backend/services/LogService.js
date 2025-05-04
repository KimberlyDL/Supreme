const { db, Timestamp } = require('../config/firebase');
const { ActionUtils } = require('../utilities/actionUtils');

/**
 * Service for logging security events and application activities
 */
class LogService {
  constructor() {
    this.securityLogsCollection = 'security_logs';
    this.activityLogsCollection = 'activity_logs';
    this.errorLogsCollection = 'error_logs';
    this.actionUtils = ActionUtils.createDefault();
  }

  /**
   * Log a security-related event
   * @param {Object} eventData - Data about the security event
   * @returns {Promise<Object>} The created log document
   */
  async logSecurityEvent(eventData) {
    try {
      // Determine action type if not provided
      if (!eventData.actionType && eventData.action) {
        const [method, url] = eventData.action.split(' ');
        eventData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        eventType: eventData.eventType || 'UNKNOWN',
        user: this._sanitizeUser(eventData.user),
        action: eventData.action,
        actionType: eventData.actionType,
        targetResource: eventData.targetResource,
        details: eventData.details,
        ip: eventData.ip,
        userAgent: eventData.userAgent,
        metadata: eventData.metadata || {},
        severity: this._determineSeverity(eventData.eventType)
      };

      if (eventData.error) {
        logData.error = eventData.error;
      }

      // Using Admin SDK method
      const docRef = await db.collection(this.securityLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging security event:', error);
      // Fallback to console logging if database logging fails
      console.warn('Security Event:', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...eventData
      }));
      return null;
    }
  }

  /**
   * Log an application activity
   * @param {Object} activityData - Data about the activity
   * @returns {Promise<Object>} The created log document
   */
  async logActivity(activityData) {
    try {
      // Determine action type if not provided
      if (!activityData.actionType && activityData.action) {
        const [method, url] = activityData.action.split(' ');
        activityData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        activityType: activityData.activityType,
        user: this._sanitizeUser(activityData.user),
        action: activityData.action,
        actionType: activityData.actionType,
        targetResource: activityData.targetResource,
        resourceId: activityData.resourceId,
        details: activityData.details,
        changes: activityData.changes || {},
        metadata: activityData.metadata || {}
      };

      // Using Admin SDK method
      const docRef = await db.collection(this.activityLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Log an application error
   * @param {Object} errorData - Data about the error
   * @returns {Promise<Object>} The created log document
   */
  async logError(errorData) {
    try {
      const logData = {
        timestamp: Timestamp.now(),
        errorType: errorData.errorType || 'APPLICATION_ERROR',
        user: errorData.user ? this._sanitizeUser(errorData.user) : null,
        action: errorData.action,
        targetResource: errorData.targetResource,
        message: errorData.message,
        stack: errorData.stack,
        details: errorData.details,
        metadata: errorData.metadata || {},
        severity: errorData.severity || 'high'
      };

      // Using Admin SDK method
      const docRef = await db.collection(this.errorLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging application error:', error);
      // Fallback to console logging
      console.error('Application Error:', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...errorData
      }));
      return null;
    }
  }

  /**
   * Sanitize user object to include only necessary fields
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   * @private
   */
  _sanitizeUser(user) {
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      role: user.role,
      firstName: user.firstName ? user.firstName : null,
      lastName: user.lastName ? user.lastName : null,
      branchId: user.branchId ? user.branchId : null,
      branchName: user.branch ? user.branch : null
    };
  }

  /**
   * Determine severity level based on event type
   * @param {string} eventType - Type of security event
   * @returns {string} Severity level
   * @private
   */
  _determineSeverity(eventType) {
    const highSeverityEvents = [
      'UNAUTHORIZED_ACCESS',
      'AUTHENTICATION_FAILURE',
      'ROLE_MODIFICATION_VIOLATION',
      'DATA_DELETION',
      'ACCOUNT_LOCKOUT',
      'ACCESS_DENIED'
    ];

    const mediumSeverityEvents = [
      'BRANCH_ACCESS_VIOLATION',
      'PASSWORD_CHANGE',
      'PROFILE_UPDATE',
      'ROLE_MIDDLEWARE_ERROR'
    ];

    if (highSeverityEvents.includes(eventType)) {
      return 'high';
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = { LogService };