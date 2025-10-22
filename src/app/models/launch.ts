export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success?: boolean;
  details?: string;
  links: {
    patch: {
      small?: string;
      large?: string
    };
    webcast?: string;
    article?: string;
  };
}
