/**
 * Utilitário para gerar PDF de contratos assinados
 */

import PDFDocument from 'pdfkit';

/**
 * Renderiza texto com suporte a formatação (negrito, itálico, sublinhado)
 * Suporta: 
 * - **texto** ou <b>texto</b> para negrito
 * - *texto* ou <i>texto</i> para itálico
 * - <u>texto</u> para sublinhado
 */
function renderTextWithFormatting(doc, text, baseFont = 'Helvetica') {
  // Processar todas as formatações: primeiro remover tags HTML, depois processar markdown
  let processedText = text;
  
  // Converter tags HTML para markdown
  processedText = processedText.replace(/<b>([^<]+)<\/b>/g, '**$1**');
  processedText = processedText.replace(/<i>([^<]+)<\/i>/g, '*$1*');
  // Manter <u> para processar depois
  
  // Encontrar todas as formatações (negrito, itálico, sublinhado)
  const parts = [];
  let currentIndex = 0;
  
  // Regex para encontrar todas as formatações
  const formatRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|<u>([^<]+)<\/u>)/g;
  let match;
  const matches = [];
  
  // Coletar todas as matches
  while ((match = formatRegex.exec(processedText)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: match[1].startsWith('**') ? 'bold' : 
            match[1].startsWith('*') ? 'italic' : 'underline',
      text: match[2] || match[3] || match[4]
    });
  }
  
  // Se não houver formatação, renderizar texto normal
  if (matches.length === 0) {
    doc.text(text, {
      paragraphGap: 2,
      align: 'left'
    });
    return;
  }
  
  // Construir partes do texto
  matches.forEach((fmt, idx) => {
    // Texto antes da formatação
    if (fmt.index > currentIndex) {
      parts.push({
        text: processedText.substring(currentIndex, fmt.index),
        bold: false,
        italic: false,
        underline: false
      });
    }
    
    // Texto formatado
    parts.push({
      text: fmt.text,
      bold: fmt.type === 'bold',
      italic: fmt.type === 'italic',
      underline: fmt.type === 'underline'
    });
    
    currentIndex = fmt.index + fmt.length;
  });
  
  // Texto restante
  if (currentIndex < processedText.length) {
    parts.push({
      text: processedText.substring(currentIndex),
      bold: false,
      italic: false,
      underline: false
    });
  }
  
  // Renderizar cada parte
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    
    // Determinar fonte baseada nas formatações
    let fontName = baseFont;
    if (part.bold && part.italic) {
      fontName = 'Helvetica-BoldOblique';
    } else if (part.bold) {
      fontName = 'Helvetica-Bold';
    } else if (part.italic) {
      fontName = 'Helvetica-Oblique';
    }
    
    doc.font(fontName);
    
    const options = {
      continued: !isLast,
      paragraphGap: isLast ? 2 : 0,
      align: 'left'
    };
    
    if (part.underline) {
      options.underline = true;
    }
    
    doc.text(part.text, options);
    
    // Restaurar fonte base
    doc.font(baseFont);
  });
}

/**
 * Gera PDF do contrato com assinatura
 */
export async function generatePDF(contrato) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const proposta = contrato.proposta || {};
      
      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', {
        align: 'center',
        underline: true,
      });
      
      doc.moveDown(2);

      // Conteúdo do contrato
      doc.fontSize(11).font('Helvetica');
      
      // Quebrar o texto do contrato em linhas e adicionar ao PDF
      const contractText = contrato.texto_contrato || '';
      const lines = contractText.split('\n');
      
      let previousWasClause = false;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine) {
          // Detectar cláusulas principais (ex: "CLÁUSULA 1", "1. OBJETO", etc.)
          const isClause = trimmedLine.match(/^(CLÁUSULA\s+\d+|\d+\.\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ])/i);
          
          // Detectar subcláusulas (ex: "1.1", "2.3", etc.)
          const isSubClause = trimmedLine.match(/^\d+\.\d+\./);
          
          // Adicionar espaçamento antes de cláusulas principais
          if (isClause && previousWasClause) {
            doc.moveDown(1.5);
          } else if (isClause) {
            doc.moveDown(1);
          } else if (isSubClause && !previousWasClause) {
            doc.moveDown(0.5);
          }
          
          // Processar texto com suporte a negrito (**texto** ou <b>texto</b>)
          if (isClause) {
            // Cláusulas principais em negrito e tamanho maior
            doc.fontSize(12);
            renderTextWithFormatting(doc, trimmedLine, 'Helvetica-Bold');
            doc.fontSize(11);
            previousWasClause = true;
          } else if (isSubClause) {
            // Subcláusulas em negrito
            renderTextWithFormatting(doc, trimmedLine, 'Helvetica-Bold');
            previousWasClause = false;
          } else {
            // Texto normal com suporte a formatação
            renderTextWithFormatting(doc, trimmedLine, 'Helvetica');
            previousWasClause = false;
          }
          
          // Espaçamento após a linha
          if (isClause) {
            doc.moveDown(0.5);
          } else {
            doc.moveDown(0.3);
          }
        } else {
          // Linha vazia - adicionar espaçamento
          doc.moveDown(0.5);
          previousWasClause = false;
        }
      });

      // Adicionar assinatura se existir
      if (contrato.assinatura_cliente && contrato.status === 'assinado') {
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica').text('Assinatura do Cliente:', {
          paragraphGap: 10,
        });
        
        // Converter base64 para imagem
        try {
          const signatureImage = Buffer.from(
            contrato.assinatura_cliente.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          );
          
          doc.image(signatureImage, {
            fit: [200, 80],
            align: 'left',
          });
        } catch (imgError) {
          console.warn('Erro ao adicionar imagem de assinatura:', imgError);
          doc.text('Assinatura digital registrada', {
            italic: true,
          });
        }

        if (contrato.data_assinatura) {
          doc.moveDown(1);
          const dataAssinatura = new Date(contrato.data_assinatura).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          doc.fontSize(10).text(`Assinado em: ${dataAssinatura}`, {
            italic: true,
          });
        }
      }

      // Adicionar ANEXO I com telas do sistema se existirem
      const telasSistema = proposta.telas_sistema;
      if (telasSistema && Array.isArray(telasSistema) && telasSistema.length > 0) {
        const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const pageBottomY = () => doc.page.height - doc.page.margins.bottom;
        const ensureSpace = (neededHeight) => {
          if (doc.y + neededHeight > pageBottomY()) {
            doc.addPage();
            return true;
          }
          return false;
        };

        // Página inicial do anexo
        doc.addPage();

        // Título do Anexo
        doc.moveDown(0.5);
        doc.fontSize(18).font('Helvetica-Bold').text('ANEXO I', {
          align: 'center',
          underline: true,
        });

        doc.moveDown(0.4);
        doc.fontSize(14).font('Helvetica-Bold').text('TELAS DO SISTEMA', {
          align: 'center',
        });

        doc.moveDown(1);
        doc
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.margins.left + contentWidth, doc.y)
          .lineWidth(1)
          .strokeColor('#E5E7EB');
        doc.moveDown(1);

        // Renderizar cada tela como um bloco bem definido (título -> descrição -> imagem)
        const telasValidas = telasSistema.filter((t) => t && t.imagem && t.titulo);
        telasValidas.forEach((tela, idx) => {
          // Separador entre telas (com espaço)
          if (idx > 0) {
            ensureSpace(40);
            doc.moveDown(0.6);
            doc
              .moveTo(doc.page.margins.left, doc.y)
              .lineTo(doc.page.margins.left + contentWidth, doc.y)
              .lineWidth(1)
              .strokeColor('#F1F5F9');
            doc.moveDown(1);
          }

          const numeroTela = idx + 1;

          // Título
          ensureSpace(60);
          doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827');
          doc.text(`Tela ${numeroTela} — ${tela.titulo}`, {
            align: 'left',
          });

          // Descrição (logo abaixo)
          if (tela.descricao && String(tela.descricao).trim()) {
            doc.moveDown(0.35);
            doc.font('Helvetica').fontSize(10.5).fillColor('#374151');
            doc.text(String(tela.descricao).trim(), {
              align: 'left',
            });
          }

          doc.moveDown(0.8);

          // Imagem (centralizada) com altura máxima dinâmica para evitar sobreposição/espremido
          try {
            const imageData = String(tela.imagem).replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(imageData, 'base64');

            // reservar pelo menos uma altura mínima para a imagem; se não couber, quebra página
            const reservedBeforeImage = 20;
            const minImageHeight = 220;
            if (doc.y + reservedBeforeImage + minImageHeight > pageBottomY()) {
              doc.addPage();
            }

            const availableHeight = Math.max(180, pageBottomY() - doc.y - 10);
            const maxHeight = Math.min(420, availableHeight);
            const maxWidth = contentWidth;

            // Borda leve “card”
            const imgTop = doc.y;
            doc
              .rect(doc.page.margins.left, imgTop - 6, contentWidth, maxHeight + 12)
              .fillOpacity(1)
              .fillAndStroke('#FFFFFF', '#E5E7EB');

            // Renderiza dentro do card
            doc.image(imageBuffer, doc.page.margins.left + 10, imgTop, {
              fit: [maxWidth - 20, maxHeight],
              align: 'center',
              valign: 'center',
            });

            // Avança o cursor abaixo do card
            doc.y = imgTop + maxHeight + 10;
          } catch (imgError) {
            console.warn(`Erro ao adicionar imagem da tela ${idx + 1}:`, imgError);
            doc.font('Helvetica-Oblique').fontSize(10).fillColor('#9CA3AF');
            doc.text('[Imagem não disponível]', { align: 'left' });
            doc.fillColor('#000000');
            doc.moveDown(0.5);
          }
        });
      }

      // Rodapé
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} - JR Technology Solutions`,
        {
          align: 'center',
          color: '#666666',
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

