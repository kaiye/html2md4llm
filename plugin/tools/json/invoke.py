"""Invoke module for HTML to JSON conversion tool."""

from typing import Any, Dict, Optional
import sys
from pathlib import Path

# Add plugin directory to path so we can import lib
plugin_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(plugin_dir))

from lib import main


class Tool:
    """Tool for converting HTML to JSON."""

    def invoke(
        self,
        html_input: str,
        remove_attributes: Optional[str] = None,
        strategy: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Convert HTML to JSON virtual DOM tree.

        Args:
            html_input: HTML string to convert
            remove_attributes: Comma-separated list of attributes to remove
            strategy: Extraction strategy ('list' or 'article')

        Returns:
            Dictionary with result
        """
        options: Dict[str, Any] = {
            'outputFormat': 'json',
        }

        # Parse remove_attributes if provided
        if remove_attributes:
            options['removeAttributes'] = [
                attr.strip() for attr in remove_attributes.split(',')
            ]

        # Add strategy if provided
        if strategy:
            options['strategy'] = strategy

        try:
            result = main(html_input, options)
            return {
                'json': result,
                'status': 'success'
            }
        except Exception as e:
            return {
                'error': str(e),
                'status': 'error'
            }
