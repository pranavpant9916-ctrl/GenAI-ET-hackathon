const { handleWebhook } = require("../services/webhook.service");

/**
 * Handle incoming GitHub webhooks
 */
exports.handleGithubWebhook = async (req, res) => {
    try {
        const eventType = req.headers['x-github-event'];
        const signature = req.headers['x-hub-signature-256'];
        const payload = req.body;

        if (!eventType) {
            return res.status(400).json({
                success: false,
                error: "Missing GitHub event type header"
            });
        }

        // Process webhook asynchronously (don't wait for completion)
        const result = await handleWebhook(eventType, payload, signature);

        res.json({
            success: true,
            message: "Webhook received and processing",
            eventType,
            result
        });

    } catch (err) {
        console.error("Webhook handler error:", err);
        res.status(500).json({
            success: false,
            error: "Webhook processing failed",
            message: err.message
        });
    }
};

/**
 * Handle generic webhooks (for other platforms)
 */
exports.handleGenericWebhook = async (req, res) => {
    try {
        const eventType = req.body.eventType || req.query.type || 'unknown';
        const payload = req.body;

        const result = await handleWebhook(eventType, payload);

        res.json({
            success: true,
            message: "Webhook received and processing",
            eventType,
            result
        });

    } catch (err) {
        console.error("Generic webhook error:", err);
        res.status(500).json({
            success: false,
            error: "Webhook processing failed",
            message: err.message
        });
    }
};

/**
 * Test webhook endpoint
 */
exports.testWebhook = (req, res) => {
    res.json({
        success: true,
        message: "Webhook endpoint is operational",
        timestamp: new Date().toISOString()
    });
};
