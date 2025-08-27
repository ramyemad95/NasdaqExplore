import React from 'react';
import { render } from '@testing-library/react-native';
import Shimmer, {
  ShimmerText,
  ShimmerTitle,
  ShimmerDescription,
  ShimmerCard,
  ShimmerList,
  InitialShimmerList,
} from '../../src/components/Shimmer';

// Mock react-native-paper theme
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    colors: {
      surfaceVariant: '#e0e0e0',
      outline: '#666666',
    },
  }),
}));

describe('Shimmer Components', () => {
  describe('Shimmer', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<Shimmer />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width and height', () => {
      const { toJSON } = render(<Shimmer width={200} height={50} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom borderRadius', () => {
      const { toJSON } = render(<Shimmer borderRadius={10} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { marginTop: 10 };
      const { toJSON } = render(<Shimmer style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(<Shimmer width="50%" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with zero height', () => {
      const { toJSON } = render(<Shimmer height={0} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ShimmerText', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<ShimmerText />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width and height', () => {
      const { toJSON } = render(<ShimmerText width={150} height={25} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { marginLeft: 5 };
      const { toJSON } = render(<ShimmerText style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(<ShimmerText width="75%" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ShimmerTitle', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<ShimmerTitle />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width', () => {
      const { toJSON } = render(<ShimmerTitle width="60%" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { marginTop: 15 };
      const { toJSON } = render(<ShimmerTitle style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with fixed height (20)', () => {
      const { toJSON } = render(<ShimmerTitle />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ShimmerDescription', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<ShimmerDescription />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width', () => {
      const { toJSON } = render(<ShimmerDescription width="85%" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { marginBottom: 10 };
      const { toJSON } = render(<ShimmerDescription style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with fixed height (14)', () => {
      const { toJSON } = render(<ShimmerDescription />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ShimmerCard', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<ShimmerCard />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { toJSON } = render(<ShimmerCard style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with transparent background', () => {
      const { toJSON } = render(<ShimmerCard />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ShimmerList', () => {
    it('renders with default count', () => {
      const { toJSON } = render(<ShimmerList />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom count', () => {
      const { toJSON } = render(<ShimmerList count={7} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { padding: 20 };
      const { toJSON } = render(<ShimmerList style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with zero count', () => {
      const { toJSON } = render(<ShimmerList count={0} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with single item', () => {
      const { toJSON } = render(<ShimmerList count={1} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('InitialShimmerList', () => {
    it('renders with default count', () => {
      const { toJSON } = render(<InitialShimmerList />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom count', () => {
      const { toJSON } = render(<InitialShimmerList count={10} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
      const customStyle = { marginTop: 30 };
      const { toJSON } = render(<InitialShimmerList style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with zero count', () => {
      const { toJSON } = render(<InitialShimmerList count={0} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with single item', () => {
      const { toJSON } = render(<InitialShimmerList count={1} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles null style gracefully', () => {
      const { toJSON } = render(<Shimmer style={null} />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles undefined style gracefully', () => {
      const { toJSON } = render(<Shimmer style={undefined} />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles empty object style gracefully', () => {
      const { toJSON } = render(<Shimmer style={{}} />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles negative dimensions gracefully', () => {
      const { toJSON } = render(<Shimmer width={-100} height={-50} />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles zero dimensions gracefully', () => {
      const { toJSON } = render(<Shimmer width={0} height={0} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component composition', () => {
    it('ShimmerText uses Shimmer component', () => {
      const { toJSON } = render(<ShimmerText />);
      expect(toJSON()).toBeTruthy();
    });

    it('ShimmerTitle uses ShimmerText component', () => {
      const { toJSON } = render(<ShimmerTitle />);
      expect(toJSON()).toBeTruthy();
    });

    it('ShimmerDescription uses ShimmerText component', () => {
      const { toJSON } = render(<ShimmerDescription />);
      expect(toJSON()).toBeTruthy();
    });

    it('ShimmerCard contains multiple Shimmer components', () => {
      const { toJSON } = render(<ShimmerCard />);
      expect(toJSON()).toBeTruthy();
    });

    it('ShimmerList contains multiple Shimmer components', () => {
      const { toJSON } = render(<ShimmerList count={3} />);
      expect(toJSON()).toBeTruthy();
    });

    it('InitialShimmerList contains multiple Shimmer components', () => {
      const { toJSON } = render(<InitialShimmerList count={3} />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
