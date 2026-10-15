export function remetenteValido(from: string) {
  return (
    /^.+ <acesso@send\.[^<>\s]+\.com\.br>$/.test(from) &&
    !/(authjs\.dev|resend\.dev)/i.test(from)
  );
}
