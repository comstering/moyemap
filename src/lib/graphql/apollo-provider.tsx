'use client';

import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './client';

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
export default ApolloWrapper;
