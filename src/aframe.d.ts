import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 
        'mindar-image'?: string; 
        'color-space'?: string; 
        'renderer'?: string; 
        'vr-mode-ui'?: string; 
        'device-orientation-permission-ui'?: string 
      };
      'a-assets': any;
      'a-camera': any;
      'a-entity': any;
      'a-video': any;
    }
  }
}
