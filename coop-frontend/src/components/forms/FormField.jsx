/**
 * Reusable form components (inputs, selects, submit buttons).
 * Use for CreateMemberForm, SavingsTransactionForm, LoanApplicationForm, etc.
 */
export function FormField({ label, id, error, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default FormField;
