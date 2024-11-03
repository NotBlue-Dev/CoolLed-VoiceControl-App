let dynamicAPIUrl: string | undefined; // Variable to hold the dynamic API URL
export let API_URL: string = process.env.EXPO_PUBLIC_API_URL ?? ""; // Default API URL

export const setAPIUrl = (url: string) => {
  dynamicAPIUrl = url; // Update the dynamic API URL
  // Update API_URL whenever the dynamicAPIUrl is set
  API_URL = dynamicAPIUrl ?? process.env.EXPO_PUBLIC_API_URL ?? ""; 
};

const multiply = 2.55;

type SlotType = 'Write' | 'Image' | 'Speed' | 'Brightness' | 'Anim' | 'Mode' | 'State';

interface ColorMapping {
  [key: string]: string;
}

interface ImageMapping {
  [key: string]: string;
}

interface SpeedBrightnessMapping {
  [key: string]: number;
}

interface AnimMapping {
  [key: string]: string;
}

interface ModeMapping {
  [key: string]: number;
}

// Define a mapping for colors
export const colorMapping: ColorMapping = {
  rouge: '#e31414',
  vert: '#00a957',
  bleu: '#0049bd',
  jaune: '#f7ff00',
  blanc: '#ffffff',
  orange: '#fd9600',
  rose: '#ff00f9',
  violet: '#6204c5',
  'vert clair': '#00ff7e',
  'bleu clair': '#6da5ff',
};

// Define a mapping for image values
const imageMapping: ImageMapping = {
  'Jeux vidéos': 'a.png',
  instagram: 'b.png',
  'smiley coeur': 'c.png',
  coeur: 'd.png',
  'smiley lunette': 'e.png',
  vitesse: 'f.png',
};

// Define a mapping for speed/brightness values
const speedBrightnessMapping: SpeedBrightnessMapping = {
  dix: Math.floor(10 * multiply),
  vingt: Math.floor(20 * multiply),
  trente: Math.floor(30 * multiply),
  quarante: Math.floor(40 * multiply),
  cinquante: Math.floor(50 * multiply),
  soixante: Math.floor(60 * multiply),
  'soixante dix': Math.floor(70 * multiply),
  'quatre vingt': Math.floor(80 * multiply),
  'quatre vingt dix': Math.floor(90 * multiply),
  cent: Math.floor(100 * multiply),
};

// Define a mapping for animation values
const animMapping: AnimMapping = {
  'formule un': 'z.gif',
  yeux: 'w.gif',
  dino: 'y.gif',
  bloc: 'v.gif',
  kebab: 'x.gif',
  turbo: 'k.gif',
  wanted: 'u.gif',
  course: 'q.gif',
};

// Define a mapping for mode values
const modeMapping: ModeMapping = {
  statique: 1,
  gauche: 2,
  droite: 3,
  haut: 4,
  bas: 5,
  flocon: 6,
  image: 7,
  laser: 8,
};

const slotMappings: Record<string, any> = {
  Write: colorMapping,
  Image: imageMapping,
  Speed: speedBrightnessMapping,
  Brightness: speedBrightnessMapping,
  Anim: animMapping,
  Mode: modeMapping,
};

export const formatDataForAPI = (
  slot: SlotType,
  value: string | number,
  color: string = 'blanc'
): string => {
  // Update color if it's a Write slot
  if (slot === 'Write' && colorMapping[color]) {
    color = colorMapping[color];
  }

  // Check if we have a mapping for the current slot and value
  const mapping = slotMappings[slot];
  if (mapping && mapping[value]) {
    value = mapping[value];
  }

  // Handle specific case for State
  if (slot === 'State') {
    value = value === 'éteindre' || value === 'éteint' ? 'Off' : 'On';
  }

  let data = {
    slot,
    value,
    color,
  };

  return JSON.stringify(data);
};

export const sendMessage = (formattedData: any): Promise<{bytes: string[], file?: string}> => {
  return new Promise(async (resolve, reject) => {
    console.log(formattedData)
    const { slot, value, color }: { slot: string; value: string; color: string } = JSON.parse(formattedData);

    const endpoints: { [key: string]: string } = {
      'Write': '/write',
      'Image': '/image',
      'Anim': '/anim',
      'Speed': '/speed',
      'Mode': '/mode',
      'Brightness': '/brightness',
      'State': '/state',
    };

    const endpoint = endpoints[slot];

    if (!endpoint) {
      reject(new Error(`Unsupported slot: ${slot}`));
    }

    const payload = slot === 'Write' ? { value, color } : { value };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        reject(new Error(`Error: ${response.statusText}`));
      }
      const result = await response.json();
      resolve(JSON.parse(result));
    } catch (error) {
      console.error('Error sending message:', error);
      reject(error);
    }
  });
}

export const testAPI = async () => {
  return new Promise(async (resolve, reject) => {
    sendMessage(formatDataForAPI('Brightness', 'cent')).then(response => {
      resolve(response);
    }
    ).catch((error) => {
      console.error('Error sending message:', error);
      reject(error);
    });
  });
}
