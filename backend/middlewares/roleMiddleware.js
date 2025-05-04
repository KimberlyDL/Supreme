// backend\middlewares\roleMiddleware.js
/**
 * Modular role-based access control middleware factory
 */
const roleMiddleware = () => {
  // Default rule handlers
  const defaultRules = {
    /**
     * Check if user has one of the allowed roles
     */
    hasRole: (req, allowedRoles = []) => {
      const userRole = req.user?.role?.toLowerCase();
      return allowedRoles.includes(userRole);
    },

    /**
     * Check if user belongs to the same branch as the resource
     */
    sameBranch: (req) => {
      const userBranch = req.user?.branchId;
      const targetBranch = req.params.branchId || req.body.branchId;

      // Owner can access any branch
      if (req.user?.role?.toLowerCase() === 'owner') return true;

      // If no target branch specified, allow access
      if (!targetBranch) return true;

      return userBranch === targetBranch;
    },

    /**
     * Check if manager is not modifying another manager
     */
    managerNotModifyingManager: (req) => {
      const userRole = req.user?.role?.toLowerCase();
      const targetRole = req.body.role || req.params.role;

      // Only apply this rule to managers
      if (userRole !== 'manager') return true;

      // If no target role specified, allow access
      if (!targetRole) return true;

      return targetRole.toLowerCase() !== 'manager';
    },

    /**
     * Check if user's role is higher or equal to target role
     */
    higherOrEqualRole: (req) => {
      const userRole = req.user?.role?.toLowerCase();
      const targetRole = req.body.role || req.params.role;

      // If no target role specified, allow access
      if (!targetRole) return true;

      const roleHierarchy = {
        'owner': 100,
        'manager': 80,
        'inventory_manager': 60,
        'stock_manager': 40,
        'cashier': 20,
        'employee': 10
      };

      const userRoleLevel = roleHierarchy[userRole] || 0;
      const targetRoleLevel = roleHierarchy[targetRole.toLowerCase()] || 0;

      return userRoleLevel >= targetRoleLevel;
    }
  };

  // Store custom rules
  const customRules = {};

  // Store URL patterns and their associated rules
  const urlPatterns = [];

  // The middleware instance
  const middleware = {
    /**
     * Add a custom rule
     * @param {string} ruleName - Name of the rule
     * @param {Function} ruleHandler - Function that implements the rule
     * @returns {Object} The middleware instance for chaining
     */
    addRule: (ruleName, ruleHandler) => {
      if (typeof ruleHandler !== 'function') {
        throw new Error(`Rule handler for "${ruleName}" must be a function`);
      }

      customRules[ruleName] = ruleHandler;
      return middleware;
    },

    /**
     * Define a URL pattern with associated rules
     * @param {string|RegExp} pattern - URL pattern to match
     * @param {Object} rules - Rules to apply for this pattern
     * @returns {Object} The middleware instance for chaining
     */
    forPattern: (pattern, rules) => {
      urlPatterns.push({ pattern, rules });
      return middleware;
    },

    /**
     * Get the middleware function
     * @returns {Function} Express middleware function
     */
    getMiddleware: () => {
      return async (req, res, next) => {
        try {
          const { LogService } = require('../services/LogService');
          const logService = new LogService();

          // Check if user exists in request (set by authMiddleware)
          if (!req.user) {
            return res.status(401).json({
              success: false,
              message: "Authentication required"
            });
          }

          // Get the action from the request method and path
          const action = `${req.method} ${req.originalUrl.split('?')[0]}`;

          // Find matching URL pattern
          let matchedPattern = null;
          let matchedRules = null;

          for (const { pattern, rules } of urlPatterns) {
            if (
              (typeof pattern === 'string' && req.path === pattern) ||
              (pattern instanceof RegExp && pattern.test(req.path))
            ) {
              matchedPattern = pattern;
              matchedRules = rules;
              break;
            }
          }

          // If no pattern matches, check if there's a default pattern
          if (!matchedPattern) {
            const defaultPattern = urlPatterns.find(p => p.pattern === '*');
            if (defaultPattern) {
              matchedRules = defaultPattern.rules;
            } else {
              // No matching pattern and no default
              await logService.logSecurityEvent({
                eventType: 'NO_ACCESS_RULE',
                user: req.user,
                action,
                targetResource: req.originalUrl,
                details: `No access rule defined for ${req.path}`,
                ip: req.ip,
                userAgent: req.headers['user-agent']
              });

              return res.status(403).json({
                success: false,
                message: "Access denied: No rule defined for this resource"
              });
            }
          }

          // Apply all rules
          const failedRules = [];

          for (const [ruleName, ruleParams] of Object.entries(matchedRules)) {
            // Get the rule handler
            const ruleHandler = customRules[ruleName] || defaultRules[ruleName];

            if (!ruleHandler) {
              console.error(`Unknown rule: ${ruleName}`);
              continue;
            }

            // Apply the rule
            const ruleResult = await ruleHandler(req, ruleParams);

            if (!ruleResult) {
              failedRules.push(ruleName);
            }
          }

          // If any rules failed, deny access
          if (failedRules.length > 0) {
            await logService.logSecurityEvent({
              eventType: 'ACCESS_DENIED',
              user: req.user,
              action,
              targetResource: req.originalUrl,
              details: `Access denied due to failed rules: ${failedRules.join(', ')}`,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            });

            return res.status(403).json({
              success: false,
              message: "You don't have permission to perform this action"
            });
          }

          // If log access is enabled in the rules
          if (matchedRules.logAccess) {
            await logService.logSecurityEvent({
              eventType: 'ACCESS_GRANTED',
              user: req.user,
              action,
              targetResource: req.originalUrl,
              details: `User successfully accessed resource`,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            });
          }

          // If all checks pass, proceed to the next middleware
          next();

        } catch (error) {
          console.error('Error in role middleware:', error);

          try {
            const { LogService } = require('../services/LogService');
            const logService = new LogService();

            await logService.logSecurityEvent({
              eventType: 'ROLE_MIDDLEWARE_ERROR',
              user: req.user || { uid: 'unknown' },
              action: `${req.method} ${req.originalUrl}`,
              targetResource: req.originalUrl,
              details: `Error in role middleware: ${error.message}`,
              error: error.stack,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            });
          } catch (logError) {
            console.error('Error logging role middleware failure:', logError);
          }

          return res.status(500).json({
            success: false,
            message: "An error occurred while checking permissions"
          });
        }
      };
    }
  };

  return middleware;
};

module.exports = roleMiddleware;