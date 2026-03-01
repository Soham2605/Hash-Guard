const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const generateBtn = document.getElementById('generateBtn');
  const algoSelect = document.getElementById('algoSelect');
  const resultArea = document.getElementById('resultArea');
  const hashText = document.getElementById('hashText');
  const fileNameEl = document.getElementById('fileName');
  const fileSizeEl = document.getElementById('fileSize');
  const copyBtn = document.getElementById('copyBtn');

  const file1 = document.getElementById('file1');
  const file2 = document.getElementById('file2');
  const pick1 = document.getElementById('pick1');
  const pick2 = document.getElementById('pick2');
  const fake1 = document.getElementById('fake1');
  const fake2 = document.getElementById('fake2');
  const compareBtn = document.getElementById('compareBtn');
  const algoSelect2 = document.getElementById('algoSelect2');
  const compareResult = document.getElementById('compareResult');
  const compareFiles = document.getElementById('compareFiles');
  const compareHashes = document.getElementById('compareHashes');
  const comparePercent = document.getElementById('comparePercent');

  let selectedFile = null;

  // upload area behavior
  uploadArea.addEventListener('click', ()=> fileInput.click());
  uploadArea.addEventListener('dragover', (e)=>{ e.preventDefault(); uploadArea.classList.add('dragover'); });
  uploadArea.addEventListener('dragleave', ()=> uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', (e)=> {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) setSelectedFile(f);
  });

  fileInput.addEventListener('change', (e)=> setSelectedFile(e.target.files[0]));

fileInput.addEventListener('change', (e)=> setSelectedFile(e.target.files[0]));

function setSelectedFile(f){
  selectedFile = f;
  
  // Show filename directly inside upload box
  uploadArea.innerHTML = `
    <div class="title">📁 ${f.name}</div>
    <div class="sub">${formatBytes(f.size)} — Ready to hash</div>
  `;

  resultArea.style.display = 'none';
}


  generateBtn.addEventListener('click', async ()=>{
    if(!selectedFile){ alert('Please upload a file first'); return; }
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('algo', algoSelect.value);

      const res = await fetch('http://localhost:8080/api/hash', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if(res.ok){
        resultArea.style.display = 'block';
        hashText.textContent = data.hash;
        fileNameEl.textContent = data.filename;
        fileSizeEl.textContent = humanSize(data.size);
      } else {
        alert(data.error || 'Server error');
      }
    } catch(err){
      alert('Request failed: ' + err.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Hash';
    }
  });

  copyBtn.addEventListener('click', ()=>{
    const text = hashText.textContent;
    navigator.clipboard.writeText(text).then(()=> {
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    });
  });

  // Compare controls
  pick1.addEventListener('click', ()=> file1.click());
  pick2.addEventListener('click', ()=> file2.click());
  file1.addEventListener('change', ()=> {
    fake1.textContent = file1.files[0] ? file1.files[0].name : 'No file selected';
    compareResult.style.display = 'none';
  });
  file2.addEventListener('change', ()=> {
    fake2.textContent = file2.files[0] ? file2.files[0].name : 'No file selected';
    compareResult.style.display = 'none';
  });

  compareBtn.addEventListener('click', async ()=>{
    if(!file1.files[0] || !file2.files[0]){ alert('Please select both files'); return; }
    compareBtn.disabled = true;
    compareBtn.textContent = 'Comparing...';
    try {
      const form = new FormData();
      form.append('file1', file1.files[0]);
      form.append('file2', file2.files[0]);
      form.append('algo', algoSelect2.value);

      const res = await fetch('http://localhost:8080/api/compare', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if(res.ok){
        compareResult.style.display = 'block';
        compareFiles.textContent = `${data.file1}  ↔  ${data.file2}`;
        compareHashes.innerHTML = `<b>Hash1:</b> ${data.hash1}<br><b>Hash2:</b> ${data.hash2}`;
        comparePercent.textContent = `Bit-level match: ${data.bit_match_percentage}%`;
      } else {
        alert(data.error || 'Server error');
      }
    } catch(err){
      alert('Request failed: ' + err.message);
    } finally {
      compareBtn.disabled = false;
      compareBtn.textContent = 'Compare';
    }
  });

  // helpers
  function formatBytes(bytes){
    if(bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes)/Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  function humanSize(n){ return formatBytes(n); }