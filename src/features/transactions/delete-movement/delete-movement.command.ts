export interface DeleteMovementCommand {
  id: string;
}

export interface DeleteMovementHandlerOutput {
  success: boolean;
  message: string;
}
