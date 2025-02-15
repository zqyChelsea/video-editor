export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  return await response.json();
};

export const getScript = async (id) => {
  const response = await fetch(`/api/script/${id}`);
  return await response.json();
};

export const updateScript = async (id, script) => {
  const response = await fetch(`/api/script/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ script })
  });
  return await response.json();
};

export const generateAudio = async (sentence) => {
  const response = await fetch('/api/generateAudio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentence })
  });
  return await response.json();
}; 