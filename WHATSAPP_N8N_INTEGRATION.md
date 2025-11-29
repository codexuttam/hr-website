# WhatsApp Community Integration with n8n

This guide details how to set up an automated workflow using **n8n** to bridge your **Alumni Community (Next.js)** with a **WhatsApp Group**.

## Overview

The integration consists of two main workflows:
1.  **Outbound (Student -> Alumni)**: When a student posts a doubt on the website, it is sent to the Alumni WhatsApp Group.
2.  **Inbound (Alumni -> Student)**: When an alumni replies in the WhatsApp Group, the reply is sent back to the website and displayed under the doubt.

---

## Prerequisites

1.  **n8n Instance**: A self-hosted or cloud version of n8n.
2.  **WhatsApp API Provider**: You need a way to send/receive WhatsApp messages programmatically.
    *   **Option A (Official)**: Meta Cloud API (requires a verified business).
    *   **Option B (Third-party)**: Twilio, Waha (WhatsApp HTTP API), or similar.
    *   *This guide assumes a generic HTTP API structure (like Waha or Meta), but concepts apply to all.*

---

## Workflow 1: Sending Doubts to WhatsApp

**Trigger**: A new post is created in your Next.js app.

### 1. Configure Next.js Webhook
You need to modify your `POST` route in `app/api/community/posts/route.ts` to call the n8n webhook after saving to the database.

```typescript
// Add this to your POST handler after successful DB insertion
await fetch('https://your-n8n-instance.com/webhook/new-doubt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    post_id: data.id,
    content: data.content,
    user_name: data.user_name,
    tags: data.tags
  })
});
```

### 2. n8n Workflow Steps
1.  **Webhook Node**:
    *   **Method**: POST
    *   **Path**: `/new-doubt`
    *   **Authentication**: None (or Header Auth if you want security).
2.  **Format Message Node (Function/Code)**:
    *   Create a clean message string.
    *   *Example JS Code*:
        ```javascript
        const post = items[0].json;
        return {
          json: {
            message: `📢 *New Student Doubt*\n\n*From:* ${post.user_name}\n*Topic:* ${post.tags.join(', ')}\n\n"${post.content}"\n\nReply to this message to answer! (Include ID: ${post.post_id} if manual)`
          }
        };
        ```
3.  **HTTP Request Node (Send to WhatsApp)**:
    *   **URL**: Your WhatsApp API Endpoint (e.g., `https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages`)
    *   **Method**: POST
    *   **Body**:
        ```json
        {
          "messaging_product": "whatsapp",
          "to": "YOUR_ALUMNI_GROUP_ID",
          "type": "text",
          "text": {
            "body": "{{json.message}}"
          }
        }
        ```

---

## Workflow 2: Receiving Replies from WhatsApp

**Trigger**: An alumni sends a message in the WhatsApp Group.

### 1. n8n Workflow Steps
1.  **Webhook Node (WhatsApp Callback)**:
    *   Set this URL as the "Callback URL" in your WhatsApp API provider settings.
    *   **Method**: POST
    *   **Path**: `/whatsapp-incoming`
2.  **Filter Node**:
    *   Check if the message is from the **Alumni Group**.
    *   Check if it is a **Reply** to a previous message (Context).
3.  **Extract Post ID (Code/Regex)**:
    *   You need to know which doubt this reply belongs to.
    *   *Strategy*: If the alumni replies to the bot's message, the bot's message body usually contains the original Post ID (hidden or in text).
    *   *Alternative*: Ask alumni to start reply with "ID: 123 ...".
    *   *Code Example*:
        ```javascript
        // Extract ID from the quoted message or current message text
        const text = items[0].json.messages[0].text.body;
        const context = items[0].json.messages[0].context; // If replying
        // Logic to find post_id...
        return { json: { post_id: extractedId, reply_content: text, sender: senderName } };
        ```
4.  **HTTP Request Node (Send to Next.js)**:
    *   **URL**: `https://your-website.com/api/webhooks/whatsapp`
    *   **Method**: POST
    *   **Header**: `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "post_id": "{{json.post_id}}",
          "sender_name": "{{json.sender}}",
          "message": "{{json.reply_content}}",
          "sender_phone": "{{json.sender_phone}}"
        }
        ```

### 2. Next.js Webhook Handler
Ensure your `/api/webhooks/whatsapp/route.ts` is ready to receive this payload (already implemented in previous steps).

---

## Testing the Loop

1.  **Start n8n**: Ensure your workflows are active.
2.  **Post a Doubt**: Go to your website's Alumni page and submit a doubt.
3.  **Check WhatsApp**: You should see the message appear in your test group.
4.  **Reply on WhatsApp**: Reply to that message.
5.  **Check Website**: Refresh the Alumni page (or check the database) to see the reply appear under the doubt.

## Troubleshooting

*   **"Post ID not found"**: Ensure your outbound message to WhatsApp includes the Post ID clearly, or use n8n's memory/database to map WhatsApp Message IDs to System Post IDs.
*   **Webhook Errors**: Check n8n execution logs to see the exact JSON payload coming from WhatsApp and adjust your extraction logic accordingly.
