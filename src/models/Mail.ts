export default interface Mail {
  createdDateTime: string;
  subject: string;
  bodyPreview: string;
  sender: {
    emailAddress: {
      name: string;
      address: string;
    }
  }
}
