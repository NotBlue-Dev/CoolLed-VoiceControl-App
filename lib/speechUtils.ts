const multiply = 2.55;

export const formatDataForWebSocket = (slot:string, value:string | number, color = 'blanc') => {
  //TODO: API

  if (slot === 'Write') {
    switch (color) {
      case 'rouge':
        color = '#e31414';
        break;
      case 'vert':
        color = '#00a957';
        break;
      case 'bleu':
        color = '#0049bd';
        break;
      case 'jaune':
        color = '#f7ff00';
        break;
      case 'blanc':
        color = '#ffffff';
        break;
      case 'orange':
        color = '#fd9600';
        break;
      case 'rose':
        color = '#ff00f9';
        break;
      case 'violet':
        color = '#6204c5';
        break;
      case 'vert clair':
        color = '#00ff7e';
        break;
      case 'bleu clair':
        color = '#6da5ff';
        break;
    }
  }

  if (slot === 'Image') {
    switch (value) {
      case 'Jeux vidéos':
        value = 'a.png';
        break;
      case 'instagram':
        value = 'b.png';
        break;
      case 'smiley coeur':
        value = 'c.png';
        break;
      case 'coeur':
        value = 'd.png';
        break;
      case 'smiley lunette':
        value = 'e.png';
        break;
      case 'vitesse':
        value = 'f.png';
        break;
    }
  }

  if (slot === 'Speed' || slot === 'Brightness') {
    switch (value) {
      case 'dix':
        value = 10 * multiply;
        break;
      case 'vingt':
        value = 20 * multiply;
        break;
      case 'trente':
        value = 30 * multiply;
        break;
      case 'quarante':
        value = 40 * multiply;
        break;
      case 'cinquante':
        value = 50 * multiply;
        break;
      case 'soixante':
        value = 60 * multiply;
        break;
      case 'soixante dix':
        value = 70 * multiply;
        break;
      case 'quatre vingt':
        value = 80 * multiply;
        break;
      case 'quatre vingt dix':
        value = 90 * multiply;
        break;
      case 'cent':
        value = 100 * multiply;
    }
  }

  if (slot === 'Anim') {
    switch (value) {
      case 'formule un':
        value = 'z.gif';
        break;
      case 'yeux':
        value = 'w.gif';
        break;
      case 'dino':
        value = 'y.gif';
        break;
      case 'bloc':
        value = 'v.gif';
        break;
      case 'kebab':
        value = 'x.gif';
        break;
      case 'turbo':
        value = 'k.gif';
        break;
      case 'wanted':
        value = 'u.gif';
        break;
      case 'course':
        value = 'q.gif';
        break;
    }
  }

  if (slot === 'Mode') {
    switch (value) {
      case 'statique':
        value = 1;
        break;
      case 'gauche':
        value = 2;
        break;
      case 'droite':
        value = 3;
        break;
      case 'haut':
        value = 4;
        break;
      case 'bas':
        value = 5;
        break;
      case 'flocon':
        value = 6;
        break;
      case 'image':
        value = 7;
        break;
      case 'laser':
        value = 8;
        break;
    }
  }

  if (slot === 'State') {
    if (value === 'éteindre') {
      value = 'Off';
    }
    if (value === 'éteint') {
      value = 'Off';
    }
    if (value === 'allumez') {
      value = 'On';
    }
    if (value === 'allume') {
      value = 'On';
    }
  }

  let data = {
    slot: slot,
    value: value,
    color: color,
  };
  return JSON.stringify(data);
};
