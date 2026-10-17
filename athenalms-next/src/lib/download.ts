/** Trigger a browser download for a file response, honouring its filename. */
export async function downloadResponse(res: Response, fallbackName: string) {
  const blob = await res.blob();

  let filename = fallbackName;
  const disposition = res.headers.get("Content-Disposition");
  if (disposition) {
    const match = /filename="?([^";]+)"?/.exec(disposition);
    if (match?.[1]) filename = decodeURIComponent(match[1]);
  }

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
