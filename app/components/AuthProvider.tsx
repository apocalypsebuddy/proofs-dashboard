'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const formFields = {
    signIn: {
      username: {
        label: "Email address",
        placeholder: "Enter your Email",
        isRequired: true,
      },
      password: {
        label: "Password",
        isRequired: true,
      },
    },
  };
  return (
      <Authenticator hideSignUp formFields={formFields}>
        {children}
      </Authenticator>
  );
}