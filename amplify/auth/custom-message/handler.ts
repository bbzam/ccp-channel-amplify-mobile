import type {
  CustomMessageTriggerEvent,
  CustomMessageTriggerHandler,
} from 'aws-lambda';

export const handler: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent
) => {
  try {
    console.log('event trigger', event);

    const baseTemplate = (
      title: string,
      message: string,
      code: string,
      footer: string
    ) => `<html>
      <body style="background-color: #f4f4f4; margin: 0; padding: 20px; font-family: Arial, sans-serif;">
        <div style="margin: 0 auto; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="padding: 40px 20px; text-align: center">
            <h1 style="color: #660d21; font-size: 3em; margin: 0 0 20px 0; font-weight: bold;">CCP CHANNEL</h1>
            <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0">${title}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0">${message}</p>
            </div>
            <div style="margin: 30px 0">
              <div style="background-color: #f0e6f4; color: #660d21; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 20px; border-radius: 5px; border: 2px dashed #660d21; display: inline-block; font-family: monospace;">${code}</div>
            </div>
            <div style="margin-top: 20px">
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0">${footer}</p>
            </div>
          </div>
        </div>
      </body>
    </html>`;

    if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
      if (!event.request.usernameParameter || !event.request.codeParameter) {
        throw new Error('Missing required parameters');
      }
      event.response.emailMessage = baseTemplate(
        'Welcome!',
        `Your user name is ${event.request.usernameParameter}`,
        event.request.codeParameter,
        'This is your temporary password (valid for 7 days). Please change it upon your first login.'
      );
      event.response.emailSubject = 'Your temporary password';
    }

    if (event.triggerSource === 'CustomMessage_ForgotPassword') {
      if (!event.request.codeParameter) {
        throw new Error('Missing verification code');
      }
      event.response.emailMessage = baseTemplate(
        'Password Reset',
        'We received a request to reset your password. Use the confirmation code below:',
        event.request.codeParameter,
        'Enter this code to reset your password.'
      );
      event.response.emailSubject = 'CCP Channel - Password Reset Code';
    }

    if (event.triggerSource === 'CustomMessage_ResendCode') {
      if (!event.request.codeParameter) {
        throw new Error('Missing verification code');
      }
      event.response.emailMessage = baseTemplate(
        'Verification Code',
        'Here is your requested verification code:',
        event.request.codeParameter,
        'Enter this code to complete your verification.'
      );
      event.response.emailSubject = 'CCP Channel - Verification Code';
    }

    if (event.triggerSource === 'CustomMessage_UpdateUserAttribute') {
      if (!event.request.codeParameter) {
        throw new Error('Missing verification code');
      }
      event.response.emailMessage = baseTemplate(
        'Verify Your Update',
        'Please verify your account update with the code below:',
        event.request.codeParameter,
        'Enter this code to confirm your account changes.'
      );
      event.response.emailSubject = 'CCP Channel - Verify Account Update';
    }

    if (event.triggerSource === 'CustomMessage_Authentication') {
      if (!event.request.codeParameter) {
        throw new Error('Missing MFA code');
      }
      event.response.emailMessage = baseTemplate(
        'Authentication Code',
        'Your multi-factor authentication code:',
        event.request.codeParameter,
        'Enter this code to complete your sign-in.'
      );
      event.response.emailSubject = 'CCP Channel - Authentication Code';
    }

    return event;
  } catch (error) {
    console.error('Error in CustomMessage trigger:', error);
    throw error;
  }
};
