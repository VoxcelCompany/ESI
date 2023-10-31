export default interface Mail {
  receivedDateTime: string;
  subject: string;
  bodyPreview: string;
  sender: {
    emailAddress: {
      name: string;
      address: string;
    }
  }
}
