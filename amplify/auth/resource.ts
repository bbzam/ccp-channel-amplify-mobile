import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';
import { addUser } from '../data/auth/add-user/resource';
import { customMessage } from '../auth/custom-message/resource';
import { listUsers } from '../data/auth/list-users/resource';
import { editUser } from '../data/auth/edit-user/resource';
import { disableUser } from '../data/auth/disable-user/resource';
import { enableUser } from '../data/auth/enable-user/resource';
import { listUser } from '../data/auth/list-user/resource';
// import { statistics } from '../data/content/statistics/resource';
import { unsubscribeUser } from '../data/auth/unsubscribe-user/resource';
import { resendInvitation } from '../data/auth/resend-invitation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'CCP Channel Verification Code',
      verificationEmailBody: (createCode) =>
        `<html>
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
            Thank you for signing up! Please use the verification code below to
            complete your registration:
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
            ${createCode()}
          </div>
        </div>

        <div style="margin-top: 20px">
          <p
            style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0"
          >
            Enter this code in the verification page to activate your account.
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
            This verification code will expire in 24 hours.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`,
    },
  },
  userAttributes: {
    givenName: {
      mutable: true,
      required: true,
    },
    familyName: {
      mutable: true,
      required: true,
    },
    birthdate: {
      mutable: true,
      required: true,
    },
    'custom:paidUntil': {
      dataType: 'DateTime',
      mutable: true,
    },
  },
  groups: ['USER', 'SUBSCRIBER', 'CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN'],
  triggers: {
    customMessage,
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
    allow.resource(addUser).to(['createUser', 'addUserToGroup']),
    allow.resource(listUsers).to(['listUsersInGroup']),
    allow
      .resource(editUser)
      .to([
        'updateUserAttributes',
        'addUserToGroup',
        'listGroupsForUser',
        'removeUserFromGroup',
      ]),
    allow
      .resource(unsubscribeUser)
      .to(['addUserToGroup', 'removeUserFromGroup']),
    allow.resource(disableUser).to(['disableUser']),
    allow.resource(enableUser).to(['enableUser']),
    allow.resource(listUser).to(['getUser']),
    allow.resource(resendInvitation).to(['createUser']),
    // allow.resource(statistics).to(['listUsersInGroup']),
  ],
});
