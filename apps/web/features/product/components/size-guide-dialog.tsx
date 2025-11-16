import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

interface SizeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SizeGuideDialog = ({ open, onOpenChange }: SizeGuideDialogProps) => {
  const measurements = [
    { size: "XS", chest: "88-92", length: "65", shoulder: "42", sleeve: "60" },
    { size: "S", chest: "92-96", length: "67", shoulder: "44", sleeve: "62" },
    { size: "M", chest: "96-100", length: "69", shoulder: "46", sleeve: "64" },
    { size: "L", chest: "100-104", length: "71", shoulder: "48", sleeve: "66" },
    {
      size: "XL",
      chest: "104-108",
      length: "73",
      shoulder: "50",
      sleeve: "68",
    },
    {
      size: "XXL",
      chest: "108-112",
      length: "75",
      shoulder: "52",
      sleeve: "70",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Size Guide</DialogTitle>
          <DialogDescription>
            All measurements are in centimeters (cm)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Chest</TableHead>
                <TableHead className="font-semibold">Length</TableHead>
                <TableHead className="font-semibold">Shoulder</TableHead>
                <TableHead className="font-semibold">Sleeve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((item) => (
                <TableRow key={item.size}>
                  <TableCell className="font-medium">{item.size}</TableCell>
                  <TableCell>{item.chest}</TableCell>
                  <TableCell>{item.length}</TableCell>
                  <TableCell>{item.shoulder}</TableCell>
                  <TableCell>{item.sleeve}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">How to Measure</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Chest:</span>{" "}
                  Measure around the fullest part of your chest, keeping the
                  tape horizontal
                </li>
                <li>
                  <span className="font-medium text-foreground">Length:</span>{" "}
                  Measure from the highest point of the shoulder to the bottom
                  hem
                </li>
                <li>
                  <span className="font-medium text-foreground">Shoulder:</span>{" "}
                  Measure from one shoulder point to the other across the back
                </li>
                <li>
                  <span className="font-medium text-foreground">Sleeve:</span>{" "}
                  Measure from the shoulder seam to the cuff edge
                </li>
              </ul>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Note:</span> This
                is an oversized fit hoodie. If you prefer a more fitted look, we
                recommend sizing down.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuideDialog;
