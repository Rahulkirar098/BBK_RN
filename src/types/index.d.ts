declare module 'react-native-maps-super-cluster' {
  import React from 'react';
  import { ViewStyle, Region } from 'react-native';
  import { MapViewProps } from 'react-native-maps';

  export interface ClusterProperties {
    pointCount: number;
    clusterId: string;
  }

  export interface ClusterGeometry {
    coordinates: [number, number];
    type: 'Point';
  }

  export interface Cluster {
    id: string;
    geometry: ClusterGeometry;
    properties: ClusterProperties;
  }

  export interface MarkerData {
    id: string;
    latitude: number;
    longitude: number;
    [key: string]: any;
  }

  export interface ClusteredMapViewProps extends Omit<MapViewProps, 'data'> {
    style?: ViewStyle;
    data: MarkerData[];
    renderMarker: (data: MarkerData) => React.ReactElement;
    renderCluster: (cluster: Cluster, onPress: () => void) => React.ReactElement;
    initialRegion?: Region;
    ref?: React.RefObject<any>;
    showsUserLocation?: boolean;
    animationEnabled?: boolean;
  }

  const ClusteredMapView: React.FC<ClusteredMapViewProps>;
  export default ClusteredMapView;
}
