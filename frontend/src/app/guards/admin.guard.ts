
import { CanActivateFn } from "@angular/router";

export const CanActivateAdmin: CanActivateFn = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.is_superuser) {
    return true;
  }
  return false;
}