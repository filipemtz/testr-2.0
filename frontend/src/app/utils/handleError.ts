// error-handler.ts

import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';

export function handleError(error: any) {
  // Função de notificação para lidar com erros
  const notifyFunction = (title: string, text: string | undefined, status: any) => {
    if (text === undefined || text === null || text === 'true' || text === 'false') {
      text = 'Unknown error occurred';
    }

    new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'slide',
      type: 'filled',
    });
  };

  if (error.error && typeof error.error === 'object') {
    Object.keys(error.error).forEach(key => {
      const errorMessages = error.error[key];
      // Verifica se a propriedade é um array
      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((message: any) => {
          notifyFunction('Error', message.toString(), 'error');
        });
      } else {
        notifyFunction('Error', errorMessages.toString(), 'error');
      }
    });
  } else {
    notifyFunction('Error', 'Unknown error occurred', 'error');
  }
}
