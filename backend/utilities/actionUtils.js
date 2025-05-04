/**
 * Utility for defining and matching actions based on HTTP method and URL patterns
 */
class ActionUtils {
    constructor() {
        this.actionPatterns = [];
    }

    /**
     * Add an action pattern
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {string|RegExp} urlPattern - URL pattern to match
     * @param {string} actionType - Human-readable action type
     * @returns {ActionUtils} This instance for chaining
     */
    addPattern(method, urlPattern, actionType) {
        this.actionPatterns.push({
            method,
            urlPattern,
            actionType
        });

        return this;
    }

    /**
     * Get action type based on HTTP method and URL
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @returns {string} Human-readable action type
     */
    getActionType(method, url) {
        // Find matching pattern
        for (const pattern of this.actionPatterns) {
            if (pattern.method !== method && pattern.method !== '*') {
                continue;
            }

            if (
                (typeof pattern.urlPattern === 'string' && url === pattern.urlPattern) ||
                (pattern.urlPattern instanceof RegExp && pattern.urlPattern.test(url))
            ) {
                return pattern.actionType;
            }
        }

        // Default action types based on HTTP method
        switch (method) {
            case 'GET':
                return 'view';
            case 'POST':
                return 'create';
            case 'PUT':
            case 'PATCH':
                return 'update';
            case 'DELETE':
                return 'delete';
            default:
                return 'access';
        }
    }

    /**
     * Create a default instance with common patterns
     * @returns {ActionUtils} Configured ActionUtils instance
     */
    static createDefault() {
        return new ActionUtils()
            // Employee actions
            .addPattern('POST', '/administrator/employees', 'create_employee')
            .addPattern('PUT', /^\/administrator\/employees\/[^\/]+$/, 'update_employee')
            .addPattern('PUT', /^\/administrator\/employees\/[^\/]+\/activate$/, 'activate_employee')
            .addPattern('PUT', /^\/administrator\/employees\/[^\/]+\/deactivate$/, 'deactivate_employee')
            .addPattern('DELETE', /^\/administrator\/employees\/[^\/]+$/, 'delete_employee')

            // Product actions
            .addPattern('POST', '/products', 'create_product')
            .addPattern('PUT', /^\/products\/[^\/]+$/, 'update_product')
            .addPattern('DELETE', /^\/products\/[^\/]+$/, 'delete_product')
            .addPattern('PUT', /^\/products\/[^\/]+\/branch\/[^\/]+\/inventory$/, 'update_inventory')

            // Branch actions
            .addPattern('POST', '/administrator/branches', 'create_branch')
            .addPattern('PUT', /^\/administrator\/branches\/[^\/]+$/, 'update_branch')
            .addPattern('PUT', /^\/administrator\/branches\/[^\/]+\/toggle-status$/, 'toggle_branch_status')
            .addPattern('DELETE', /^\/administrator\/branches\/[^\/]+$/, 'delete_branch');
    }
}

module.exports = { ActionUtils };