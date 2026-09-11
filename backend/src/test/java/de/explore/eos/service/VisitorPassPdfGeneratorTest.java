package de.explore.eos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.UUID;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

import de.explore.eos.entity.VisitPassData;

class VisitorPassPdfGeneratorTest
{
	private static final String VERIFICATION_URL = "https://eos.example/api/v1/visits/6cb075c2-3f53-4ed3-bce8-f79ebcb23991/pass/verify?token=signed";

	@Test
	void createsAReadableSinglePagePdfWithScannableVerificationQr() throws Exception
	{
		VisitPassData data = new VisitPassData(
			UUID.fromString("6cb075c2-3f53-4ed3-bce8-f79ebcb23991"),
			"Amin Müller", "Example GmbH", LocalDate.of(2026, 9, 11), "Project workshop",
			"Sam Schmidt", "ON_SITE", "EOS Berlin", "Alexanderplatz 1", "10178", "Berlin", "DE",
			"Please wear the pass visibly.");

		byte[] pdf = new VisitorPassPdfGenerator().generate(data, VERIFICATION_URL);

		try (var document = Loader.loadPDF(pdf))
		{
			assertEquals(1, document.getNumberOfPages());
			String text = new PDFTextStripper().getText(document);
			assertTrue(text.contains("VISITOR PASS"));
			assertTrue(text.contains("Amin Müller"));
			assertTrue(text.contains("Project workshop"));

			var resources = document.getPage(0).getResources();
			String decodedUrl = null;
			for (var name : resources.getXObjectNames())
			{
				if (resources.getXObject(name) instanceof PDImageXObject image)
				{
					var luminance = new BufferedImageLuminanceSource(image.getImage());
					decodedUrl = new MultiFormatReader().decode(new BinaryBitmap(new HybridBinarizer(luminance))).getText();
				}
			}
			assertEquals(VERIFICATION_URL, decodedUrl);
		}
	}
}
