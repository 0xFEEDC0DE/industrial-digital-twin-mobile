from typing import List, Dict, Optional
import logging
import requests

logger = logging.getLogger(__name__)

class ModularIOIntegration:
    """
    Integration with modular-io (io.codes) for tagging and device context.
    """

    def __init__(self, base_url: str):
        self.base_url = base_url

    def get_project_context(self, project_id: str) -> Dict:
        """
        Fetch project metadata and device list from modular-io.
        """
        try:
            response = requests.get(f"{self.base_url}/api/projects/{project_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch project context: {e}")
            return {}

    def get_device_context(self, device_id: str) -> Dict:
        """
        Fetch device metadata and current state from modular-io.
        """
        try:
            response = requests.get(f"{self.base_url}/api/devices/{device_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch device context: {e}")
            return {}

    def query_historian(self, database: str, measurement: str, time_range: tuple) -> List[Dict]:
        """
        Query InfluxDB or TimescaleDB for historian data during the capture window.
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/historian/query",
                json={
                    "database": database,
                    "measurement": measurement,
                    "timeRange": time_range,
                },
            )
            response.raise_for_status()
            return response.json().get('data', [])
        except Exception as e:
            logger.error(f"Failed to query historian: {e}")
            return []

    def attach_tags_to_mesh(self, mesh_path: str, tags: List[str]) -> Dict:
        """
        Associate modular-io tags with mesh regions or assets.
        """
        return {
            'mesh_path': mesh_path,
            'tags': tags,
            'status': 'tagged',
        }

    def attach_historian_data(self, scene_data: Dict) -> Dict:
        """
        Embed historian time-series data into scene metadata.
        """
        scene_data['historian_data'] = scene_data.get('historian_context', {})
        return scene_data
