import { useEffect, useRef } from 'react';
import { httpService } from '@/services/http';

export function useShipperLocationTracking(isActive: boolean) {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Nếu không kích hoạt, xóa theo dõi
    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      console.warn("Trình duyệt không hỗ trợ Geolocation");
      return;
    }

    // Theo dõi vị trí liên tục
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          await httpService.post('/delivery/my-location', {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy
          });
          // Không log liên tục để tránh rác console
        } catch (error) {
          console.error("Lỗi khi gửi vị trí:", error);
        }
      },
      (error) => {
        console.warn("Không lấy được GPS: ", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive]);
}
