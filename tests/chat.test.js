import test from 'node:test';
import assert from 'node:assert/strict';
import { handleChat } from '../src/app/api/chat/route.ts';

function createMockOpenAI() {
  return {
    responses: {
      async *create() {
        yield { type: 'response.output_text.delta', delta: 'hello' };
        yield { type: 'response.completed' };
      }
    }
  };
}

const mockRequestBody = {
  messages: [
    { role: 'user', content: 'hi', id: '1', timestamp: 0 }
  ],
  command: 'explain',
  context: { card: { front: 'f', back: 'b' }, backHidden: false }
};

const req = new Request('http://localhost/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(mockRequestBody)
});

test('handleChat streams SSE events', async (t) => {
  const openAI = createMockOpenAI();
  const res = await handleChat(req, openAI);
  assert.equal(res.headers.get('Content-Type'), 'text/event-stream');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let data = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    data += decoder.decode(value);
  }
  const events = data.trim()
    .split('\n\n')
    .map(e => JSON.parse(e.replace('data: ', '')));
  assert.equal(events[0].type, 'metadata');
  assert.equal(events[1].type, 'content');
  assert.equal(events[1].content, 'hello');
  assert.equal(events[2].type, 'done');
});
