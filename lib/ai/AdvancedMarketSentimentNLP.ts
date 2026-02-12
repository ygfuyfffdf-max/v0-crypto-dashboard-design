    return assets.map(asset => ({
      asset,
      direction: analysis.assetSpecificSentiment[asset].score > 0 ? 'up' : 'down',
      magnitude: Math.abs(analysis.assetSpecificSentiment[asset].score),
    }));
  }
}
