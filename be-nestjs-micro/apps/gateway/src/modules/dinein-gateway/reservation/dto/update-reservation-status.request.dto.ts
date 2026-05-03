import { ReservationStatus } from '@app/contracts/dinein/enums/reservation-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReservationStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(ReservationStatus, { message: 'Trạng thái đặt bàn không hợp lệ' })
  status: ReservationStatus;
}
