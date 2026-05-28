import { gql } from '@apollo/client/core';
import { VENUE_CARD_FIELDS, VENUE_DETAIL_FIELDS, VENUE_MARKER_FIELDS } from './fragments';

// 지도 마커용 - 뷰포트 bounds 기반으로 표시할 핀 조회
export const GET_VENUE_MARKERS = gql`
  ${VENUE_MARKER_FIELDS}
  query GetVenueMarkers($input: GetVenueMarkersInput) {
    venueMarkers(input: $input) {
      ...VenueMarkerFields
    }
  }
`;

// 사이드바/바텀시트 목록용 - 카테고리/가격/지역 필터 조회
// NOTE: 서버에 bounds 파라미터 추가 요청 필요 (현재 GetVenuesInput에 없음)
export const GET_VENUES = gql`
  ${VENUE_CARD_FIELDS}
  query GetVenues($input: GetVenuesInput) {
    venues(input: $input) {
      ...VenueCardFields
    }
  }
`;

// 상세 페이지용 - 단건 전체 정보 조회
export const GET_VENUE = gql`
  ${VENUE_DETAIL_FIELDS}
  query GetVenue($id: ID!) {
    venue(id: $id) {
      ...VenueDetailFields
    }
  }
`;
