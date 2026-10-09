/// <reference types="vite/client" />

interface UADataBrand {
  brand: string;
  version: string;
}

interface UAHighEntropyValues {
  model?: string;
  platformVersion?: string;
  platform?: string;
  brands?: UADataBrand[];
}

interface NavigatorUAData {
  brands: UADataBrand[];
  mobile: boolean;
  platform: string;
  getHighEntropyValues(hints: string[]): Promise<UAHighEntropyValues>;
}

interface Navigator {
  userAgentData?: NavigatorUAData;
}
