export interface DialogStartResponse {
  sessionId: string;
  message: string;
  status: string;
}

export interface DialogMessageResponse {
  sessionId: string;
  message: string;
  status: string;
}

const jsonHeaders = {
  'Content-Type': 'application/json'
};

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.message || `Ошибка запроса: ${response.status}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function startDialog(terminalId: string, language = 'ru'): Promise<DialogStartResponse> {
  const response = await fetch('/api/dialog/start', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ terminal_id: terminalId, language })
  });
  return handleJsonResponse<DialogStartResponse>(response);
}

export async function sendDialogMessage(
  sessionId: string,
  text: string,
  extra?: { audioDurationMs?: number; sttConfidence?: number }
): Promise<DialogMessageResponse> {
  const response = await fetch(`/api/dialog/${sessionId}/message`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      text,
      audio_duration_ms: extra?.audioDurationMs ?? null,
      stt_confidence: extra?.sttConfidence ?? null
    })
  });
  return handleJsonResponse<DialogMessageResponse>(response);
}

export async function completeDialog(sessionId: string): Promise<void> {
  const response = await fetch(`/api/dialog/${sessionId}/complete`, {
    method: 'POST'
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.message || `Ошибка запроса: ${response.status}`;
    throw new Error(message);
  }
}
