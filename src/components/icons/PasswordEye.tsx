export default function PasswordEye({
  showPassword,
}: {
  showPassword: boolean;
}) {
  return showPassword ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12C4.5 7.5 8.25 4.5 12 4.5s7.5 3 9.75 7.5c-2.25 4.5-6 7.5-9.75 7.5S4.5 16.5 2.25 12z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12C4.5 7.5 8.25 4.5 12 4.5s7.5 3 9.75 7.5c-2.25 4.5-6 7.5-9.75 7.5S4.5 16.5 2.25 12z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}
