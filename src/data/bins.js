export const Bins = {
  COMPOST: 'compost',
  LANDFILL: 'landfill',
  OTHER: 'other',
  RECYCLING: 'recycling'
};

const imageToBinMap = {
  'black-bin': Bins.LANDFILL,
  'blue-bin': Bins.RECYCLING,
  'green-bin': Bins.COMPOST,
  'other-bin': Bins.OTHER
};

export function imageToBin(image) {
  return imageToBinMap[image];
}

export function binToImage(bin) {
  return Object.keys(imageToBinMap).find(image => imageToBinMap[image] === bin);
}
