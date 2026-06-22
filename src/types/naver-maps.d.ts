declare namespace naver.maps {
  class Map {
    constructor(el: HTMLElement, options: object);
    getCenter(): LatLng;
    getBounds(): LatLngBounds;
    setCenter(latlng: LatLng): void;
    panTo(latlng: LatLng, options?: object): void;
    setZoom(zoom: number, animation?: boolean): void;
    destroy(): void;
  }
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }
  class LatLngBounds {
    getMin(): LatLng;
    getMax(): LatLng;
  }
  class Marker {
    constructor(options: object);
    setMap(map: Map | null): void;
    setIcon(icon: object): void;
    setZIndex(zIndex: number): void;
    getPosition(): LatLng;
  }
  class InfoWindow {
    constructor(options: object);
    open(map: Map, marker: Marker): void;
    close(): void;
  }
  namespace Event {
    function addListener(target: object, event: string, handler: () => void): void;
  }
  class Size {
    constructor(w: number, h: number);
  }
  class Point {
    constructor(x: number, y: number);
  }
}

interface Window {
  naver: typeof naver;
}
