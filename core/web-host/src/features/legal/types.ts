export type TransactionDocRow = {
  id: string;
  name: string;
  docType: string;
  status: string;
  signedDate: string | Date | null;
  fileUrl: string | null;
};
