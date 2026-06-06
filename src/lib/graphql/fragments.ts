import { gql } from '@apollo/client/core';

export const VENUE_MARKER_FIELDS = gql`
  fragment VenueMarkerFields on VenueMarker {
    id
    title
    category
    minPrice
    latitude
    longitude
    region
  }
`;

export const VENUE_CARD_FIELDS = gql`
  fragment VenueCardFields on Venue {
    id
    title
    category
    location {
      name
      address
      latitude
      longitude
      region
    }
    minPrice
    currency
    imageUrl
    sourceUrl
    tags
  }
`;

export const VENUE_DETAIL_FIELDS = gql`
  fragment VenueDetailFields on Venue {
    id
    title
    category
    status
    location {
      name
      address
      latitude
      longitude
      region
      city
      district
    }
    minPrice
    currency
    imageUrl
    description
    sourceUrl
    tags
    createdAt
    updatedAt
  }
`;
