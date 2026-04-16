import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import locationsData from '@/data/locations.json';
import mothersonLocationsData from '@/data/motherson-locations.json';

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  type?: 'cefa' | 'motherson';
}

const cefaLocations = locationsData.map((l) => ({ ...l, type: 'cefa' }) as Location);

const mothersonLocations = (mothersonLocationsData as Location[])
  .filter(
    (l) =>
      !l.name.toLowerCase().includes('cefa') &&
      !l.name.toLowerCase().includes('modulos ribera alta') &&
      !l.name.toLowerCase().includes('mra')
  )
  .map((l, idx) => ({ ...l, id: `motherson-${idx}`, type: 'motherson' }) as Location);

interface Props {
  tooltipLabel?: string;
  contactText?: string;
}

export default function InteractiveMap({
  tooltipLabel = 'Operational Units',
  contactText = 'Contact details',
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const cssVars = getComputedStyle(document.documentElement);
    const colorCefaLight = cssVars.getPropertyValue('--color-cefa-light').trim();
    const colorMapMotherson = cssVars.getPropertyValue('--color-map-motherson').trim();
    const colorMapMothersonHover = cssVars.getPropertyValue('--color-map-motherson-hover').trim();

    let isMounted = true;
    const isMobile = window.innerWidth < 768;
    const initialZoom = isMobile ? 0.7 : 1.2;
    const initialCenter: [number, number] = [0, 35];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: initialCenter,
      zoom: initialZoom,
      scrollZoom: false,
      attributionControl: false,
      renderWorldCopies: false,
      fadeDuration: 0,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    map.current.on('load', () => {
      if (!map.current || !isMounted) return;

      map.current.resize();
      requestAnimationFrame(() => map.current?.resize());

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        offset: 35,
        maxWidth: '320px',
      });

      let hoverTimer: ReturnType<typeof setTimeout> | null = null;
      let cefaHovered = false;

      const updatePopup = (loc: Location, immediate = false) => {
        if (hoverTimer) clearTimeout(hoverTimer);

        const show = () => {
          const isCEFA = loc.type === 'cefa';
          const el = popup.getElement();
          if (el) {
            el.classList.remove('cefa-popup', 'motherson-popup');
            el.classList.add(isCEFA ? 'cefa-popup' : 'motherson-popup');
          }

          popup.setHTML(`
            <div class="p-6 ${isCEFA ? 'bg-cefa-red' : 'bg-gray-800'} text-white min-w-64 shadow-none border-none outline-none">
              <p class="text-[0.65rem] font-medium uppercase tracking-[0.2em] mb-4 opacity-90">
                ${isCEFA ? 'CEFA' : 'MOTHERSON GROUP'}
              </p>
              <h3 class="${isCEFA ? 'text-2xl' : 'text-xl'} font-light mb-1.5 leading-tight">${loc.name}</h3>
              <p class="text-[0.9rem] opacity-90 ${isCEFA ? 'mb-8' : 'mb-0'} font-light font-sans">
                ${loc.city}, ${loc.country}
              </p>
              ${
                isCEFA
                  ? `
              <a href="#contact" class="contact-link inline-flex items-center gap-2 text-white font-medium group/btn outline-none focus:outline-none" data-location="${loc.id}">
                <span class="border-b border-white/30 pb-0.5 group-hover/btn:border-white transition-colors text-[0.9rem]">${contactText}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="transition-transform group-hover/btn:translate-x-1">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              `
                  : ''
              }
            </div>
          `);
          popup.setLngLat(loc.coordinates).addTo(map.current!);
        };

        if (immediate) {
          show();
        } else {
          hoverTimer = setTimeout(show, 300);
        }
      };

      const mothersonGeojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: mothersonLocations.map((loc) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: loc.coordinates },
          properties: { ...loc },
        })),
      };

      map.current.addSource('motherson-locations', {
        type: 'geojson',
        data: mothersonGeojson,
      });

      map.current.addLayer({
        id: 'motherson-points',
        type: 'circle',
        source: 'motherson-locations',
        paint: {
          'circle-radius': 4,
          'circle-color': colorMapMotherson,
          'circle-stroke-width': 1,
          'circle-stroke-color': colorCefaLight,
          'circle-opacity': 0.8,
        },
      });

      map.current.addLayer({
        id: 'motherson-points-hover',
        type: 'circle',
        source: 'motherson-locations',
        paint: {
          'circle-radius': 6,
          'circle-color': colorMapMothersonHover,
          'circle-stroke-width': 2,
          'circle-stroke-color': colorCefaLight,
        },
        filter: ['==', ['get', 'id'], ''],
      });

      map.current.on('click', 'motherson-points', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties as Location;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        updatePopup({ ...props, coordinates: coords }, true);
        map.current?.flyTo({ center: coords, zoom: 12, essential: true, duration: 2000 });
      });

      map.current.on('mouseenter', 'motherson-points', (e) => {
        if (!map.current || cefaHovered) return;
        map.current.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties as Location;
          map.current.setFilter('motherson-points-hover', ['==', ['get', 'id'], props.id]);
          const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
          updatePopup({ ...props, coordinates: coords }, false);
        }
      });

      map.current.on('mouseleave', 'motherson-points', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        map.current.setFilter('motherson-points-hover', ['==', ['get', 'id'], '']);
        if (hoverTimer) clearTimeout(hoverTimer);
      });

      cefaLocations.forEach((loc) => {
        if (!map.current) return;
        const el = document.createElement('div');
        el.className = 'cefa-marker-container';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div class="cefa-marker-pulse"></div>
          <div class="cefa-marker-dot"></div>
        `;

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(loc.coordinates)
          .addTo(map.current);

        el.addEventListener('mouseenter', () => {
          cefaHovered = true;
          updatePopup(loc, false);
        });

        el.addEventListener('mouseleave', () => {
          cefaHovered = false;
          if (hoverTimer) clearTimeout(hoverTimer);
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          updatePopup(loc, true);
          map.current?.flyTo({
            center: loc.coordinates,
            zoom: 12,
            essential: true,
            duration: 2000,
          });
        });
      });

      map.current.on('click', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['motherson-points'],
        });
        if (features.length === 0) {
          if (hoverTimer) clearTimeout(hoverTimer);
          popup.remove();
        }
      });
    });

    return () => {
      isMounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [tooltipLabel, contactText]);

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] bg-gray-50/10">
      <div ref={mapContainer} className="w-full h-full" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .maplibregl-map,
        .maplibregl-canvas-container {
           overflow: visible !important;
        }
        .maplibregl-popup {
           z-index: 1000;
        }
        .cefa-popup {
           z-index: 1001;
        }
        .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 0 !important;
          overflow: hidden !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .maplibregl-popup-tip {
          display: none !important;
        }
        
        .cefa-popup .maplibregl-popup-content,
        .motherson-popup .maplibregl-popup-content {
          background: transparent !important;
        }

        .maplibregl-ctrl-bottom-right {
          bottom: 20px;
          right: 20px;
        }
        .maplibregl-ctrl-group {
          border-radius: 4px;
          border: 1px solid var(--color-shadow-subtle);
          background: white !important;
        }

        .cefa-marker-container {
          width: 20px;
          height: 20px;
          pointer-events: auto;
        }
        .cefa-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: var(--color-cefa-red);
          border-radius: 50%;
          z-index: 2;
          box-shadow: none;
        }
        .cefa-marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 30px;
          margin-top: -15px;
          margin-left: -15px;
          background: var(--color-cefa-red);
          border-radius: 50%;
          z-index: 1;
          opacity: 0;
          pointer-events: none;
          animation: cefa-ripple 1.5s infinite ease-out;
        }
        @keyframes cefa-ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
