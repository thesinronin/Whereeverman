# Specify the place types to include in place information responses

**Place types** are categories that identify the characteristics of a place. A
place can have one or more place types assigned to it, as well as a single
**primary type** that best characterizes it.

In the Maps JavaScript API (Places Library), place types serve two main
functions:

1.  **Response Data:** Returned in the `types` and `primaryType` fields from
    Place Details (New), Nearby Search (New), Text Search (New), and
    Autocomplete (New) requests.
2.  **Request Filtering:** Specified in search and autocomplete request
    parameters to restrict or filter responses so they only include (or exclude)
    places matching those types.

--------------------------------------------------------------------------------

## Understanding Place Type Tables

Google Maps Platform organizes place types into three distinct tables. Knowing
which table a type belongs to is critical because **not all place types can be
used as request filters**.

### 1. Table A: Supported for Requests and Responses

[**Table A**](https://developers.google.com/maps/documentation/javascript/place-types#table-a)
contains the primary set of place types that can be returned in responses
**and** used as filter parameters in requests:

-   **Nearby Search (New) requests:** Used in `includedTypes`, `excludedTypes`,
    `includedPrimaryTypes`, and `excludedPrimaryTypes`.
-   **Text Search (New) requests:** Used in the `includedType` parameter
    (accepts a single string value).
-   **Autocomplete (New) requests & Widgets:** Used in the
    `includedPrimaryTypes` parameter.
-   **Responses:** Used to populate `types` and `primaryType` across Place
    Details (New), Nearby Search (New), Text Search (New), and Autocomplete
    (New).

#### Common Table A Categories and Representative Types

*(See the
[official Table A documentation](https://developers.google.com/maps/documentation/javascript/place-types#table-a)
for the exhaustive list of 300+ types)*

Category                       | Representative Place Types
:----------------------------- | :-------------------------
**Automotive**                 | `car_dealer`, `car_rental`, `car_repair`, `car_wash`, `electric_vehicle_charging_station`, `gas_station`, `parking`, `parking_garage`, `parking_lot`, `rest_stop`, `tire_shop`
**Business**                   | `business_center`, `corporate_office`, `coworking_space`, `farm`, `manufacturer`, `ranch`, `supplier`
**Culture**                    | `art_gallery`, `art_museum`, `auditorium`, `castle`, `cultural_landmark`, `historical_place`, `history_museum`, `monument`, `museum`, `performing_arts_theater`
**Education**                  | `academic_department`, `educational_institution`, `library`, `preschool`, `primary_school`, `research_institute`, `school`, `secondary_school`, `university`
**Entertainment & Recreation** | `amusement_park`, `aquarium`, `botanical_garden`, `bowling_alley`, `casino`, `city_park`, `comedy_club`, `community_center`, `concert_hall`, `convention_center`, `dog_park`, `event_venue`, `garden`, `hiking_area`, `historical_landmark`, `marina`, `movie_theater`, `national_park`, `night_club`, `park`, `plaza`, `state_park`, `tourist_attraction`, `water_park`, `wedding_venue`, `zoo`
**Facilities**                 | `public_bath`, `public_bathroom`, `stable`
**Finance**                    | `accounting`, `atm`, `bank`
**Food & Drink**               | `american_restaurant`, `bakery`, `bar`, `barbecue_restaurant`, `breakfast_restaurant`, `brewery`, `brunch_restaurant`, `cafe`, `Chinese_restaurant`, `cocktail_bar`, `coffee_shop`, `deli`, `dessert_shop`, `diner`, `fast_food_restaurant`, `fine_dining_restaurant`, `food_court`, `french_restaurant`, `Greek_restaurant`, `hamburger_restaurant`, `ice_cream_shop`, `indian_restaurant`, `italian_restaurant`, `japanese_restaurant`, `Korean_restaurant`, `meal_delivery`, `meal_takeaway`, `mediterranean_restaurant`, `mexican_restaurant`, `pizza_restaurant`, `pub`, `ramen_restaurant`, `restaurant`, `sandwich_shop`, `seafood_restaurant`, `spanish_restaurant`, `sports_bar`, `steak_house`, `sushi_restaurant`, `tea_house`, `thai_restaurant`, `vegan_restaurant`, `vegetarian_restaurant`, `vietnamese_restaurant`, `wine_bar`, `winery`
**Geographical Areas**         | `administrative_area_level_1`, `administrative_area_level_2`, `country`, `locality`, `postal_code`, `school_district`
**Government**                 | `city_hall`, `courthouse`, `embassy`, `fire_station`, `government_office`, `local_government_office`, `police`, `post_office`
**Health & Wellness**          | `chiropractor`, `dental_clinic`, `dentist`, `doctor`, `drugstore`, `general_hospital`, `hospital`, `massage`, `medical_center`, `medical_clinic`, `medical_lab`, `pharmacy`, `physiotherapist`, `spa`, `wellness_center`, `yoga_studio`
**Housing**                    | `apartment_building`, `apartment_complex`, `condominium_complex`, `housing_complex`
**Lodging**                    | `bed_and_breakfast`, `campground`, `camping_cabin`, `cottage`, `extended_stay_hotel`, `guest_house`, `hostel`, `hotel`, `inn`, `lodging`, `motel`, `resort_hotel`, `rv_park`
**Natural Features**           | `beach`, `island`, `lake`, `mountain_peak`, `nature_preserve`, `river`, `scenic_spot`, `woods`
**Places of Worship**          | `buddhist_temple`, `church`, `hindu_temple`, `mosque`, `shinto_shrine`, `synagogue`
**Services**                   | `barber_shop`, `beauty_salon`, `catering_service`, `cemetery`, `child_care_agency`, `consultant`, `courier_service`, `electrician`, `florist`, `funeral_home`, `hair_salon`, `insurance_agency`, `laundry`, `lawyer`, `locksmith`, `moving_company`, `nail_salon`, `painter`, `pet_care`, `plumber`, `real_estate_agency`, `roofing_contractor`, `storage`, `tailor`, `tour_agency`, `tourist_information_center`, `travel_agency`, `veterinary_care`
**Shopping**                   | `auto_parts_store`, `bicycle_store`, `book_store`, `butcher_shop`, `cell_phone_store`, `clothing_store`, `convenience_store`, `cosmetics_store`, `department_store`, `discount_store`, `electronics_store`, `farmers_market`, `flea_market`, `food_store`, `furniture_store`, `garden_center`, `gift_shop`, `grocery_store`, `hardware_store`, `home_goods_store`, `home_improvement_store`, `jewelry_store`, `liquor_store`, `market`, `pet_store`, `shoe_store`, `shopping_mall`, `sporting_goods_store`, `store`, `supermarket`, `thrift_store`, `toy_store`, `warehouse_store`, `wholesaler`
**Sports**                     | `arena`, `athletic_field`, `fitness_center`, `golf_course`, `gym`, `ice_skating_rink`, `playground`, `ski_resort`, `sports_club`, `sports_complex`, `stadium`, `swimming_pool`, `tennis_court`
**Transportation**             | `airport`, `airstrip`, `bike_sharing_station`, `bridge`, `bus_station`, `bus_stop`, `ferry_terminal`, `heliport`, `international_airport`, `light_rail_station`, `park_and_ride`, `subway_station`, `taxi_stand`, `train_station`, `tram_stop`, `transit_depot`, `transit_station`, `transit_stop`, `truck_stop`

--------------------------------------------------------------------------------

### 2. Table B: Response-Only & Autocomplete Primary Types

[**Table B**](https://developers.google.com/maps/documentation/javascript/place-types#table-b)
lists additional place type values that may be returned in responses (when
`types` or `primaryType` are requested in the field mask).

> **Important Constraint:** Values from Table B **cannot** be used as filter
> parameters in Nearby Search (New) or Text Search (New) requests. The **only**
> exception is using them in the `includedPrimaryTypes` parameter for a Place
> Autocomplete (New) request or widget.

**Table B Values:**

-   `administrative_area_level_3` through `administrative_area_level_7`
-   `archipelago`, `colloquial_area`, `continent`, `establishment`, `finance`,
    `food`, `general_contractor`, `geocode`, `health`, `intersection`,
    `landmark`, `natural_feature`, `neighborhood`, `place_of_worship`,
    `plus_code`, `point_of_interest`, `political`, `postal_code_prefix`,
    `postal_code_suffix`, `postal_town`, `premise`, `route`, `street_address`
-   `sublocality`, `sublocality_level_1` through `sublocality_level_5`
-   `subpremise`, `town_square`

--------------------------------------------------------------------------------

### 3. Address Types and Address Component Types

When inspecting the `addressComponents` field of a `Place` result (via
`google.maps.places.AddressComponent`), the `types` array indicates the type of
each part of the address.

Common address component types include:

-   **Street/Building level:** `street_address`, `route`, `intersection`,
    `street_number`, `premise`, `subpremise`, `floor`, `room`, `post_box`,
    `parking`
-   **Civil/Geographic divisions:** `country`, `administrative_area_level_1`
    (e.g., US States), `administrative_area_level_2` (e.g., US Counties),
    `locality` (city/town), `sublocality`, `neighborhood`, `postal_code`,
    `postal_town`, `political`
-   **Landmarks & POIs:** `point_of_interest`, `landmark`, `establishment`,
    `natural_feature`, `airport`, `park`, `bus_station`, `train_station`,
    `transit_station`, `plus_code`

--------------------------------------------------------------------------------

## Request Parameter Reference Matrix

Different Places API methods and UI Kit elements accept different parameters for
filtering by place type:

API / Component                                                  | Parameter Name                                                                               | Value Type                               | Supported Tables        | Notes
:--------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------- | :---------------------- | :----
**`Place.searchNearby()`**                                       | `includedTypes`<br>`excludedTypes`<br>`includedPrimaryTypes`<br>`excludedPrimaryTypes`       | `string[]`                               | **Table A only**        | Filters places matching any of the included types or excluding any of the excluded types.
**`Place.searchByText()`**                                       | `includedType`                                                                               | `string` (single)                        | **Table A only**        | Filters results to match a single type. Combine with `useStrictTypeFiltering: true` to strictly enforce the type.
**`AutocompleteSuggestion.fetchAutocompleteSuggestions()`**      | `includedPrimaryTypes`                                                                       | `string[]`                               | **Table A & Table B**   | Restricts predictions to places whose primary type matches one of the specified values.
**`PlaceAutocompleteElement` / `BasicPlaceAutocompleteElement`** | `includedPrimaryTypes`                                                                       | `string[]`                               | **Table A & Table B**   | Property on the web component instance.
**`<gmp-place-nearby-search-request>`**                          | `included-primary-types`<br>`included-types`<br>`excluded-primary-types`<br>`excluded-types` | Space/comma attribute or `string[]` prop | **Table A only**        | Used inside `<gmp-place-search>` UI Kit components.
**`Place.fetchFields()` / Search `fields`**                      | `fields: ['types', 'primaryType', 'primaryTypeDisplayName']`                                 | `string[]`                               | Returns **Table A & B** | Field mask required to read the place's assigned types in the response object.

--------------------------------------------------------------------------------

## Code Workflows & Implementation Patterns

### 1. Filtering Nearby Search by Place Types (`Place.searchNearby`)

Use `includedPrimaryTypes`, `excludedPrimaryTypes`, `includedTypes`, or
`excludedTypes` in `Place.searchNearby()` to filter nearby places. To inspect
the returned types on each `Place` instance, include `'types'` and
`'primaryType'` in the `fields` array.

Source:
[samples/place-nearby-search/index.ts](https://github.com/googlemaps/js-samples/blob/HEAD/samples/place-nearby-search/index.ts?utm_campaign=gmp_git_agentskills_v1)

```typescript
async function initMap() {
  const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

  const center = new google.maps.LatLng(52.369358, 4.889258);

  const map = new Map(document.getElementById('map') as HTMLElement, {
    center: center,
    zoom: 14,
    mapId: 'DEMO_MAP_ID',
    internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
  });

  const request: google.maps.places.SearchNearbyRequest = {
    // Request 'types' and 'primaryType' in the field mask to inspect them in the response
    fields: ['displayName', 'location', 'businessStatus', 'types', 'primaryType'],
    locationRestriction: {
      center: center,
      radius: 500,
    },
    // Filter by Table A types:
    includedPrimaryTypes: ['restaurant', 'cafe'],
    excludedTypes: ['fast_food_restaurant'],
    maxResultCount: 10,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: 'en-US',
    region: 'us',
    // @ts-ignore - Usage attribution ID for Places Service API calls
    internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
  };

  const { places } = await Place.searchNearby(request);

  if (places.length) {
    const { LatLngBounds } = await google.maps.importLibrary('core') as google.maps.CoreLibrary;
    const bounds = new LatLngBounds();

    places.forEach((place) => {
      console.log(`${place.displayName} - Primary Type: ${place.primaryType}, All Types: ${place.types?.join(', ')}`);

      new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      bounds.extend(place.location as google.maps.LatLng);
    });

    map.fitBounds(bounds);
  } else {
    console.log('No results');
  }
}

initMap();
```

--------------------------------------------------------------------------------

### 2. Filtering Text Search by Place Type (`Place.searchByText`)

Unlike Nearby Search, `Place.searchByText()` accepts a **single** type string
via the `includedType` parameter (from Table A). You can also set
`useStrictTypeFiltering: true` so the API only returns places that strictly
match the `includedType` rather than treating it as a soft bias.

Source:
[samples/place-text-search/index.ts](https://github.com/googlemaps/js-samples/blob/HEAD/samples/place-text-search/index.ts?utm_campaign=gmp_git_agentskills_v1)

```typescript
async function findPlacesByText() {
  const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

  const request: google.maps.places.SearchByTextRequest = {
    textQuery: 'Tacos in Mountain View',
    fields: ['displayName', 'location', 'businessStatus', 'primaryType', 'types'],
    // Specify a single type from Table A
    includedType: 'mexican_restaurant',
    // Set to true to strictly restrict results to places matching includedType
    useStrictTypeFiltering: true,
    locationBias: { lat: 37.4161493, lng: -122.0812166 },
    isOpenNow: true,
    maxResultCount: 8,
    language: 'en-US',
    region: 'us',
    // @ts-ignore - Usage attribution ID for Places Service API calls
    internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
  };

  const { places } = await Place.searchByText(request);

  for (const place of places) {
    console.log(place.displayName, place.primaryType, place.types);
  }
}
```

--------------------------------------------------------------------------------

### 3. Restricting Autocomplete Suggestions by Primary Type (`AutocompleteSuggestion`)

When fetching programmatic autocomplete predictions using
`AutocompleteSuggestion.fetchAutocompleteSuggestions()`, pass
`includedPrimaryTypes` in the request body. Both **Table A** and **Table B**
types are supported here (for example, `['restaurant']` from Table A or
`['geocode', 'establishment']` from Table B).

Source:
[samples/place-autocomplete-data-simple/index.ts](https://github.com/googlemaps/js-samples/blob/HEAD/samples/place-autocomplete-data-simple/index.ts?utm_campaign=gmp_git_agentskills_v1)

```typescript
async function initAutocompleteData() {
  const { AutocompleteSessionToken, AutocompleteSuggestion } =
    await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

  const token = new AutocompleteSessionToken();

  const request: google.maps.places.AutocompleteRequest = {
    input: 'Tadi',
    locationRestriction: { west: -122.44, north: 37.8, east: -122.39, south: 37.78 },
    origin: { lat: 37.7893, lng: -122.4039 },
    // Supports up to 5 types from Table A or Table B
    includedPrimaryTypes: ['restaurant'],
    language: 'en-US',
    region: 'us',
    sessionToken: token,
  };

  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

  if (suggestions.length > 0 && suggestions[0].placePrediction) {
    const place = suggestions[0].placePrediction.toPlace();

    // Fetch place details including its types and primaryType
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'primaryType', 'types'],
    });

    console.log(`Selected: ${place.displayName} (${place.primaryType})`);
    console.log('Assigned types:', place.types);
  }
}
```

--------------------------------------------------------------------------------

### 4. Inspecting Place Types & Address Component Types (`Place.fetchFields`)

When retrieving details for a specific place using `Place.fetchFields()`,
request `'types'`, `'primaryType'`, `'primaryTypeDisplayName'`, and
`'addressComponents'` to inspect both the place's categorization and the
granular types of its address components.

Source:
[samples/place-class/index.ts](https://github.com/googlemaps/js-samples/blob/HEAD/samples/place-class/index.ts?utm_campaign=gmp_git_agentskills_v1)

```typescript
async function getPlaceTypesAndAddressComponents() {
  const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

  const place = new Place({
    id: 'ChIJN5Nz71W3j4ARhx5bwpTQEGg',
    requestedLanguage: 'en',
  });

  await place.fetchFields({
    fields: [
      'displayName',
      'primaryType',
      'primaryTypeDisplayName',
      'types',
      'addressComponents',
    ],
  });

  console.log('Place Name:', place.displayName);
  console.log('Primary Type Code:', place.primaryType); // e.g., "corporate_office"
  console.log('Primary Type Display Name:', place.primaryTypeDisplayName); // e.g., "Corporate office"
  console.log('All Place Types:', place.types); // e.g., ["corporate_office", "point_of_interest", "establishment"]

  // Inspect individual address component types (e.g., street_number, route, locality, postal_code)
  if (place.addressComponents) {
    for (const component of place.addressComponents) {
      console.log(`${component.longText}: [${component.types.join(', ')}]`);
    }
  }
}
```

--------------------------------------------------------------------------------

### 5. Displaying and Filtering Place Types in Places UI Kit Web Components

When using Places UI Kit web components (`<gmp-place-search>`,
`<gmp-place-details>`, or `<gmp-place-details-compact>`):

-   Include `<gmp-place-type>` inside `<gmp-place-content-config>` to display
    the place's localized primary type in the UI.
-   Set `included-primary-types` on `<gmp-place-nearby-search-request>` to
    filter search results.

Source:
[examples/places-ui-kit-3d/src/components/place-search/place-search.tsx](https://github.com/visgl/react-google-maps/blob/HEAD/examples/places-ui-kit-3d/src/components/place-search/place-search.tsx?utm_campaign=gmp_git_agentskills_v1)

```html
<!-- Places UI Kit Search Component filtering by primary type and displaying the place type badge -->
<gmp-place-search
  selectable
  truncation-preferred
  internal-usage-attribution-ids="gmp_git_agentskills_v1">

  <!-- Configure the UI to render the place rating and place type -->
  <gmp-place-content-config>
    <gmp-place-rating></gmp-place-rating>
    <gmp-place-type></gmp-place-type>
  </gmp-place-content-config>

  <!-- Filter the Nearby Search request using Table A types -->
  <gmp-place-nearby-search-request
    location-restriction="37.7893,-122.4039,500"
    included-primary-types="restaurant"
    max-result-count="10">
  </gmp-place-nearby-search-request>
</gmp-place-search>
```

--------------------------------------------------------------------------------

## Pitfalls & Best Practices

1.  **Do Not Use Table B Types in Search Requests:** Passing Table B types (such
    as `point_of_interest`, `establishment`, `food`, or `neighborhood`) into
    `Place.searchNearby()` or `Place.searchByText()` will result in an invalid
    request error. Always verify that your search filter types are in **Table
    A**.
2.  **Singular vs. Plural Parameter Names:**
    -   `Place.searchByText()` uses singular `includedType: string` (only 1 type
        allowed).
    -   `Place.searchNearby()` uses plural `includedTypes: string[]`,
        `excludedTypes: string[]`, `includedPrimaryTypes: string[]`, and
        `excludedPrimaryTypes: string[]`.
    -   `AutocompleteSuggestion` and Autocomplete Elements use plural
        `includedPrimaryTypes: string[]`.
3.  **Missing `primaryType` in Responses:** A place's `primaryType` may be
    `null` or `undefined` if its primary category is not yet a supported type in
    Table A or Table B. When `primaryType` is present, it is guaranteed to also
    be listed in the `types` array.
4.  **Always Include `types` or `primaryType` in `fields`:** In the Place class
    API, fields are not returned unless explicitly requested in the `fields`
    array of `fetchFields()`, `searchNearby()`, or `searchByText()`.
