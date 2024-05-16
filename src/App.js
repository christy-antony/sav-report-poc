import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';


function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch('http://localhost:5149/api/Templates/template1.html');
        if (!response.ok) {
          throw new Error('Failed to fetch HTML content');
        }
        const htmlData = await response.text();
        setHtmlContent(htmlData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchHtmlContent();
  }, []); 

  const exportToPdf = () => {
    const element = document.getElementById('contentToExport');

    html2canvas(element)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('exported_file.pdf');
      })
      .catch(error => {
        console.error('Error exporting to PDF:', error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    
    <div>
      <div id="contentToExport" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <button  onClick={exportToPdf}>Export as PDF</button>
    </div>
  );
}

export default App;
