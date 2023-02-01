import { Params, ExportComponentReturn } from "react-component-export-image";

export const exportComponentAsPNG: (
  node: React.RefObject<React.ReactInstance>,
  params?: Params | undefined
) => ExportComponentReturn = jest.fn();
export const exportComponentAsJPEG: (
  node: React.RefObject<React.ReactInstance>,
  params?: Params | undefined
) => ExportComponentReturn = jest.fn();
export const exportComponentAsPDF: (
  node: React.RefObject<React.ReactInstance>,
  params?: Params | undefined
) => ExportComponentReturn = jest.fn();

export default {
  exportComponentAsPNG,
  exportComponentAsJPEG,
  exportComponentAsPDF
};
