import * as tf from '@tensorflow/tfjs';
import { SupplyChainEvent, AnomalyAlert, AnomalyType, AlertSeverity, Location } from '@/types';

export class AnomalyDetectionSystem {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private anomalyThreshold = 0.7;

  constructor(threshold: number = 0.7) {
    this.anomalyThreshold = threshold;
  }

  /**
   * Initialize the anomaly detection system
   */
  async initialize(): Promise<void> {
    try {
      // For this demo, we'll create a simple neural network
      // In production, you'd load a pre-trained model
      this.model = await this.createAnomalyModel();
      this.isInitialized = true;
      console.log('Anomaly detection system initialized');
    } catch (error) {
      console.error('Failed to initialize anomaly detection:', error);
      throw error;
    }
  }

  /**
   * Analyze a supply chain event for anomalies
   */
  async analyzeEvent(
    event: SupplyChainEvent,
    previousEvents: SupplyChainEvent[]
  ): Promise<AnomalyAlert[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const anomalies: AnomalyAlert[] = [];

    try {
      // Rule-based anomaly detection
      const ruleBasedAnomalies = this.detectRuleBasedAnomalies(event, previousEvents);
      anomalies.push(...ruleBasedAnomalies);

      // ML-based anomaly detection (if model is available)
      if (this.model) {
        const mlAnomalies = await this.detectMLBasedAnomalies(event, previousEvents);
        anomalies.push(...mlAnomalies);
      }

      // Time-based anomaly detection
      const timeAnomalies = this.detectTimeAnomalies(event, previousEvents);
      anomalies.push(...timeAnomalies);

      // Location-based anomaly detection
      const locationAnomalies = this.detectLocationAnomalies(event, previousEvents);
      anomalies.push(...locationAnomalies);

      // Certification anomaly detection
      const certificationAnomalies = this.detectCertificationAnomalies(event, previousEvents);
      anomalies.push(...certificationAnomalies);

      return anomalies;
    } catch (error) {
      console.error('Error analyzing event for anomalies:', error);
      return [];
    }
  }

  /**
   * Detect rule-based anomalies
   */
  private detectRuleBasedAnomalies(
    event: SupplyChainEvent,
    previousEvents: SupplyChainEvent[]
  ): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];

    // Check for duplicate events
    const duplicateEvent = previousEvents.find(
      e => e.eventType === event.eventType && 
      e.location.city === event.location.city &&
      Math.abs(new Date(e.timestamp).getTime() - new Date(event.timestamp).getTime()) < 3600000 // 1 hour
    );

    if (duplicateEvent) {
      anomalies.push(this.createAnomalyAlert(
        event,
        AnomalyType.SUSPICIOUS_PATTERN,
        AlertSeverity.MEDIUM,
        'Duplicate event detected within 1 hour',
        0.8
      ));
    }

    // Check for impossible speed (location jumps)
    if (previousEvents.length > 0) {
      const lastEvent = previousEvents[previousEvents.length - 1];
      const distance = this.calculateDistance(lastEvent.location, event.location);
      const timeDiff = (new Date(event.timestamp).getTime() - new Date(lastEvent.timestamp).getTime()) / 1000 / 3600; // hours
      
      if (distance > 0 && timeDiff > 0) {
        const speed = distance / timeDiff; // km/h
        
        // Flag if speed is over 1000 km/h (impossible for ground transport)
        if (speed > 1000) {
          anomalies.push(this.createAnomalyAlert(
            event,
            AnomalyType.LOCATION_JUMP,
            AlertSeverity.HIGH,
            `Impossible transport speed: ${speed.toFixed(2)} km/h`,
            0.9
          ));
        }
      }
    }

    // Check for unexpected event sequence
    const unexpectedSequence = this.detectUnexpectedEventSequence(event, previousEvents);
    if (unexpectedSequence) {
      anomalies.push(unexpectedSequence);
    }

    return anomalies;
  }

  /**
   * Detect ML-based anomalies using TensorFlow.js
   */
  private async detectMLBasedAnomalies(
    event: SupplyChainEvent,
    previousEvents: SupplyChainEvent[]
  ): Promise<AnomalyAlert[]> {
    if (!this.model) return [];

    try {
      // Prepare features for ML model
      const features = this.extractFeatures(event, previousEvents);
      const inputTensor = tf.tensor2d([features]);

      // Get prediction from model
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const predictionValue = await prediction.data();
      const anomalyScore = predictionValue[0];

      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();

      if (anomalyScore > this.anomalyThreshold) {
        return [this.createAnomalyAlert(
          event,
          AnomalyType.SUSPICIOUS_PATTERN,
          this.scoresToSeverity(anomalyScore),
          `ML model detected anomaly (score: ${anomalyScore.toFixed(3)})`,
          anomalyScore
        )];
      }

      return [];
    } catch (error) {
      console.error('Error in ML anomaly detection:', error);
      return [];
    }
  }

  /**
   * Detect time-based anomalies
   */
  private detectTimeAnomalies(
    event: SupplyChainEvent,
    previousEvents: SupplyChainEvent[]
  ): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];

    // Check for events in the past
    if (previousEvents.length > 0) {
      const lastEventTime = new Date(previousEvents[previousEvents.length - 1].timestamp);
      const currentEventTime = new Date(event.timestamp);

      if (currentEventTime < lastEventTime) {
        anomalies.push(this.createAnomalyAlert(
          event,
          AnomalyType.TIME_INCONSISTENCY,
          AlertSeverity.HIGH,
          'Event timestamp is earlier than previous event',
          0.85
        ));
      }
    }

    // Check for events outside business hours for certain event types
    const eventHour = new Date(event.timestamp).getHours();
    const businessHoursEvents = ['processing', 'quality_check', 'packaging'];
    
    if (businessHoursEvents.includes(event.eventType) && (eventHour < 6 || eventHour > 22)) {
      anomalies.push(this.createAnomalyAlert(
        event,
        AnomalyType.TIME_INCONSISTENCY,
        AlertSeverity.MEDIUM,
        'Business event occurring outside normal hours',
        0.6
      ));
    }

    return anomalies;
  }

  /**
   * Detect location-based anomalies
   */
  private detectLocationAnomalies(
    event: SupplyChainEvent,
    previousEvents: SupplyChainEvent[]
  ): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];

    // Check for unexpected country jumps
    if (previousEvents.length > 0) {
      const recentEvents = previousEvents.slice(-3); // Last 3 events
      const countries = recentEvents.map(e => e.location.country);
      
      if (!countries.includes(event.location.country) && countries.length > 0) {
        // Check if it's a reasonable progression (neighboring countries or logical trade route)
        const isReasonableJump = this.isReasonableCountryTransition(countries[countries.length - 1], event.location.country);
        
        if (!isReasonableJump) {
          anomalies.push(this.createAnomalyAlert(
            event,
            AnomalyType.LOCATION_JUMP,
            AlertSeverity.MEDIUM,
            `Unexpected country transition: ${countries[countries.length - 1]} → ${event.location.country}`,
            0.7
          ));
        }
      }
    }

    return anomalies;
  }

  /**
   * Detect certification anomalies
   */
  private detectCertificationAnomalies(
    event: SupplyChainEvent,
    _previousEvents: SupplyChainEvent[]
  ): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];

    // Check for missing certifications when expected
    const certificationEvents = ['certification', 'quality_check'];
    if (certificationEvents.includes(event.eventType) && (!event.certifications || event.certifications.length === 0)) {
      anomalies.push(this.createAnomalyAlert(
        event,
        AnomalyType.CERTIFICATION_MISMATCH,
        AlertSeverity.MEDIUM,
        'Expected certifications missing for certification event',
        0.6
      ));
    }

    // Check for expired certifications
    if (event.certifications) {
      const expiredCertifications = event.certifications.filter(cert => {
        if (!cert.expiryDate) return false;
        return new Date(cert.expiryDate) < new Date(event.timestamp);
      });

      if (expiredCertifications.length > 0) {
        anomalies.push(this.createAnomalyAlert(
          event,
          AnomalyType.CERTIFICATION_MISMATCH,
          AlertSeverity.HIGH,
          `${expiredCertifications.length} expired certification(s) detected`,
          0.8
        ));
      }
    }

    return anomalies;
  }

  /**
   * Create a simple anomaly detection model
   */
  private async createAnomalyModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // In a real implementation, you would train this model with historical data
    // For this demo, we'll use it with random weights as a placeholder

    return model;
  }

  /**
   * Extract features from event for ML model
   */
  private extractFeatures(event: SupplyChainEvent, previousEvents: SupplyChainEvent[]): number[] {
    const features: number[] = [];

    // Feature 1: Hour of day (normalized)
    features.push(new Date(event.timestamp).getHours() / 24);

    // Feature 2: Day of week (normalized)
    features.push(new Date(event.timestamp).getDay() / 7);

    // Feature 3: Event type encoded
    const eventTypes = ['harvest', 'processing', 'packaging', 'shipping', 'quality_check', 'storage', 'retail_arrival', 'sale'];
    features.push(eventTypes.indexOf(event.eventType) / eventTypes.length);

    // Feature 4: Participant type encoded
    const participantTypes = ['farmer', 'processor', 'distributor', 'retailer', 'certifier'];
    features.push(participantTypes.indexOf(event.participantType) / participantTypes.length);

    // Feature 5: Number of certifications
    features.push((event.certifications?.length || 0) / 10);

    // Feature 6: Time since last event (hours, normalized)
    if (previousEvents.length > 0) {
      const timeDiff = (new Date(event.timestamp).getTime() - new Date(previousEvents[previousEvents.length - 1].timestamp).getTime()) / (1000 * 3600);
      features.push(Math.min(timeDiff / 168, 1)); // Normalize to week
    } else {
      features.push(0);
    }

    // Feature 7: Distance from last event (normalized)
    if (previousEvents.length > 0) {
      const distance = this.calculateDistance(previousEvents[previousEvents.length - 1].location, event.location);
      features.push(Math.min(distance / 10000, 1)); // Normalize to 10,000 km
    } else {
      features.push(0);
    }

    // Feature 8: Number of previous events
    features.push(Math.min(previousEvents.length / 100, 1));

    // Feature 9: Country code encoded (simplified)
    features.push(event.location.country.charCodeAt(0) / 255);

    // Feature 10: Metadata complexity
    features.push(Math.min(Object.keys(event.metadata || {}).length / 10, 1));

    return features;
  }

  /**
   * Helper methods
   */
  private createAnomalyAlert(
    event: SupplyChainEvent,
    type: AnomalyType,
    severity: AlertSeverity,
    description: string,
    score: number
  ): AnomalyAlert {
    return {
      id: `anomaly-${event.id}-${Date.now()}`,
      batchId: event.batchId,
      eventId: event.id,
      type,
      severity,
      description,
      detectedAt: new Date().toISOString(),
      score,
      isResolved: false
    };
  }

  private scoresToSeverity(score: number): AlertSeverity {
    if (score >= 0.9) return AlertSeverity.CRITICAL;
    if (score >= 0.8) return AlertSeverity.HIGH;
    if (score >= 0.6) return AlertSeverity.MEDIUM;
    return AlertSeverity.LOW;
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    if (!loc1.coordinates || !loc2.coordinates) return 0;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(loc2.coordinates.latitude - loc1.coordinates.latitude);
    const dLon = this.degreesToRadians(loc2.coordinates.longitude - loc1.coordinates.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(loc1.coordinates.latitude)) * 
      Math.cos(this.degreesToRadians(loc2.coordinates.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private detectUnexpectedEventSequence(
    event: SupplyChainEvent,
    _previousEvents: SupplyChainEvent[]
  ): AnomalyAlert | null {
    if (_previousEvents.length === 0) return null;

    const expectedSequences = {
      harvest: ['processing', 'quality_check', 'packaging'],
      processing: ['quality_check', 'packaging', 'storage'],
      packaging: ['shipping', 'storage'],
      shipping: ['storage', 'retail_arrival'],
      storage: ['shipping', 'retail_arrival', 'quality_check'],
      retail_arrival: ['sale']
    };

    const lastEvent = _previousEvents[_previousEvents.length - 1];
    const expectedNext = expectedSequences[lastEvent.eventType as keyof typeof expectedSequences];

    if (expectedNext && !expectedNext.includes(event.eventType)) {
      return this.createAnomalyAlert(
        event,
        AnomalyType.SUSPICIOUS_PATTERN,
        AlertSeverity.MEDIUM,
        `Unexpected event sequence: ${lastEvent.eventType} → ${event.eventType}`,
        0.7
      );
    }

    return null;
  }

  private isReasonableCountryTransition(fromCountry: string, toCountry: string): boolean {
    // Simplified logic - in production, you'd have a comprehensive database
    const tradeRoutes = {
      'Brazil': ['USA', 'Germany', 'Netherlands', 'Japan'],
      'Colombia': ['USA', 'Germany', 'Netherlands', 'Japan'],
      'Ethiopia': ['USA', 'Germany', 'Italy', 'Japan'],
      'Vietnam': ['USA', 'Germany', 'Japan', 'South Korea'],
      'China': ['USA', 'Germany', 'Japan', 'South Korea'],
      'India': ['USA', 'Germany', 'UAE', 'UK']
    };

    return tradeRoutes[fromCountry]?.includes(toCountry) || 
           tradeRoutes[toCountry]?.includes(fromCountry) ||
           fromCountry === toCountry;
  }

  /**
   * Update anomaly threshold
   */
  setAnomalyThreshold(threshold: number): void {
    this.anomalyThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Get current anomaly threshold
   */
  getAnomalyThreshold(): number {
    return this.anomalyThreshold;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
  }
}