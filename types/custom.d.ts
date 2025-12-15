declare module 'next-auth/providers';
declare module '@retracedhq/logs-viewer';
declare module 'react-daisyui/dist/types' {
  export type ComponentStatus =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'ghost'
    | 'link';
}

declare module 'next-auth' {
  export type AuthOptions = any;
  export type Account = any;
  export type Profile = any;
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
