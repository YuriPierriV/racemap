// Supondo que a função getBounds esteja definida em algum lugar
const getBounds = (outer) => {
  if (outer.length === 0) {
    throw new Error("O array não pode estar vazio");
  }

  let initialBounds = {
    latMin: outer[0].lat,
    latMax: outer[0].lat,
    longMin: outer[0].long,
    longMax: outer[0].long
  };

  let bounds = outer.reduce((acc, point) => {
    return {
      latMin: Math.min(acc.latMin, point.lat),
      latMax: Math.max(acc.latMax, point.lat),
      longMin: Math.min(acc.longMin, point.long),
      longMax: Math.max(acc.longMax, point.long)
    };
  }, initialBounds);

  return bounds;
};

export const drawFull = (canvasRef, inner, outer, padding = 50, curveIntensity = 0.2, rotation = 0) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Obtém os limites utilizando a função getBounds
  const bounds = getBounds(outer); // Usando a função getBounds para obter os limites
  const adjustedScaleX = (canvas.width - 2 * padding) / (bounds.longMax - bounds.longMin);
  const adjustedScaleY = (canvas.height - 2 * padding) / (bounds.latMax - bounds.latMin);

  const rotationAngle = (rotation * Math.PI) / 180;

  // Função para rotacionar um ponto em torno do centro do canvas
  const rotatePoint = (x, y) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;

    const rotatedX = centerX + dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle);
    const rotatedY = centerY + dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle);

    return { x: rotatedX, y: rotatedY };
  };

  const drawCurvedPath = (path, color) => {
    ctx.beginPath();

    path.forEach((pos, index) => {
      const x = (pos.long - bounds.longMin) * adjustedScaleX + padding;
      const y = canvas.height - ((pos.lat - bounds.latMin) * adjustedScaleY + padding);

      // Aplica a rotação no ponto
      const { x: rotatedX, y: rotatedY } = rotatePoint(x, y);

      if (index === 0) {
        ctx.moveTo(rotatedX, rotatedY);
      } else {
        const prev = path[index - 1];
        const prevX = (prev.long - bounds.longMin) * adjustedScaleX + padding;
        const prevY = canvas.height - ((prev.lat - bounds.latMin) * adjustedScaleY + padding);

        // Aplica a rotação no ponto anterior
        const { x: prevRotatedX, y: prevRotatedY } = rotatePoint(prevX, prevY);

        const midX = (prevRotatedX + rotatedX) / 2;
        const midY = (prevRotatedY + rotatedY) / 2;

        const controlX = prevRotatedX + (rotatedX - prevRotatedX) * curveIntensity;
        const controlY = prevRotatedY + (rotatedY - prevRotatedY) * curveIntensity;

        ctx.quadraticCurveTo(controlX, controlY, midX, midY);
      }
    });

    // Conclui a curva para o ponto inicial
    const first = path[0];
    const firstX = (first.long - bounds.longMin) * adjustedScaleX + padding;
    const firstY = canvas.height - ((first.lat - bounds.latMin) * adjustedScaleY + padding);
    const { x: firstRotatedX, y: firstRotatedY } = rotatePoint(firstX, firstY);

    ctx.lineTo(firstRotatedX, firstRotatedY);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Desenha o inner com suavização
  drawCurvedPath(inner, 'white');

  // Desenha o outer com suavização
  drawCurvedPath(outer, 'white'); // Exemplo, cor diferente para outer
};




export const drawTrace = (canvasRef, status, closeTrace = false, outer, inner = [], ctxOuter = null, padding = 50) => {
  const canvas = canvasRef.current;

  if (!canvas) return; // Check if canvas exists

  const ctx = canvas.getContext('2d');

  // Draw the 'outer' only once and save the context
  if (ctxOuter) {
    try {
      ctx.putImageData(ctxOuter.current, 0, 0); // Restore the outer's saved state
    } catch (error) {
      return "get ctx";
    }
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  let trace = [];

  //faz o desenho necessário
  if (status === "externo") {
    trace = outer;
  } else if (status === "interno") {
    trace = inner;
  } else {
    return;
  }

  if (trace.length < 1) return;

  // Obtém os limites utilizando a função getBounds
  const bounds = getBounds(outer); // Usando a função getBounds para obter os limites

  // Calcula a escala ajustada com base no tamanho do canvas e no padding
  const adjustedScaleX = (canvas.width - 2 * padding) / (bounds.longMax - bounds.longMin);
  const adjustedScaleY = (canvas.height - 2 * padding) / (bounds.latMax - bounds.latMin);

  // Desenha o traçado
  ctx.beginPath();
  trace.forEach((pos, index) => {
    const x = (pos.long - bounds.longMin) * adjustedScaleX + padding;
    const y = canvas.height - ((pos.lat - bounds.latMin) * adjustedScaleY + padding);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  // Se o traçado precisa ser fechado, conecta o último ponto ao primeiro
  if (closeTrace) {
    ctx.lineTo((trace[0].long - bounds.longMin) * adjustedScaleX + padding,
      canvas.height - ((trace[0].lat - bounds.latMin) * adjustedScaleY + padding));

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    return;
  }

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Desenha os pontos do traçado
  trace.forEach((pos) => {
    const x = (pos.long - bounds.longMin) * adjustedScaleX + padding;
    const y = canvas.height - ((pos.lat - bounds.latMin) * adjustedScaleY + padding);

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  });
};
