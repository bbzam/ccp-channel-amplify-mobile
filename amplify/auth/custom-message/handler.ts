import type {
  CustomMessageTriggerEvent,
  CustomMessageTriggerHandler,
} from 'aws-lambda';

export const handler: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent
) => {
  try {
    console.log('event trigger', event);
    
    // Only process AdminCreateUser messages
    if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
      // Validate required parameters
      if (!event.request.usernameParameter || !event.request.codeParameter) {
        throw new Error('Missing required parameters');
      }

      const message = `<html>
        <body
          style="
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              margin: 0 auto;
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            "
          >
            <div style="padding: 40px 20px; text-align: center">
              <h1
                style="
                  color: #660d21;
                  font-size: 3em;
                  margin: 0 0 20px 0;
                  font-weight: bold;
                "
              >
                CCP CHANNEL
              </h1>
      
              <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0">
                Welcome!
              </h2>
      
              <div
                style="
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-radius: 6px;
                  margin: 20px 0;
                "
              >
                <p
                  style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0"
                >
                  Your user name is ${event.request.usernameParameter}
                </p>
              </div>
      
              <div style="margin: 30px 0">
                <div
                  style="
                    background-color: #f0e6f4;
                    color: #660d21;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    padding: 20px;
                    border-radius: 5px;
                    border: 2px dashed #660d21;
                    display: inline-block;
                    font-family: monospace;
                  "
                >
                  ${event.request.codeParameter}
                </div>
              </div>
      
              <div style="margin-top: 20px">
                <p
                  style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0"
                >
                  This is your temporary password. Please change it upon your first login.
                </p>
              </div>
      
              <div
                style="
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                "
              >
                <p style="color: #999999; font-size: 14px; margin: 0">
                  If you didn't create an account, you can safely ignore this email.
                </p>
                <p style="color: #999999; font-size: 14px; margin: 10px 0 0 0">
                  This temporary password will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>`;

      event.response.emailMessage = message;
      event.response.emailSubject = 'Your temporary password';
    }

    return event;
  } catch (error) {
    console.error('Error in CustomMessage trigger:', error);
    throw error; // Re-throw to ensure AWS Lambda knows the execution failed
  }
};
