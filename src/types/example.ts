export type ExampleCategory =
  | 'All'
  | 'Basics'
  | 'GPIO'
  | 'LEDs'
  | 'Buttons'
  | 'UART / Serial'
  | 'I2C'
  | 'SPI'
  | 'Displays'
  | 'Sensors'
  | 'Communication';

export interface ExampleFile {
  name: string;
  content: string;
  language?: string;
}

export interface Example {
  id: string;
  name: string;
  category: ExampleCategory;
  secondaryCategories?: ExampleCategory[];
  description: string;
  icon: string;
  hardware: string[];
  libraries: string[];
  whatYouLearn: string[];
  mainFile: string;
  files: ExampleFile[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}
