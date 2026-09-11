package de.explore.eos.service;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import jakarta.enterprise.context.ApplicationScoped;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import de.explore.eos.entity.VisitPassData;

import javax.imageio.ImageIO;

@ApplicationScoped
public class VisitorPassPdfGenerator
{
	private static final PDFont REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
	private static final PDFont BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
	private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.uuuu");

	public byte[] generate(VisitPassData pass, String verificationUrl)
	{
		try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream())
		{
			PDPage page = new PDPage(PDRectangle.A4);
			document.addPage(page);
			applyMetadata(document, pass);

			try (PDPageContentStream canvas = new PDPageContentStream(document, page))
			{
				drawHeader(canvas, pass);
				drawDetails(canvas, pass);
				drawQr(document, canvas, verificationUrl);
				drawFooter(canvas, pass);
			}
			document.save(output);
			return output.toByteArray();
		}
		catch (IOException exception)
		{
			throw new IllegalStateException("Could not generate visitor-pass PDF", exception);
		}
	}

	private void drawHeader(PDPageContentStream canvas, VisitPassData pass) throws IOException
	{
		canvas.setNonStrokingColor(new Color(25, 45, 64));
		canvas.addRect(0, 722, PDRectangle.A4.getWidth(), 120);
		canvas.fill();
		text(canvas, BOLD, 26, 48, 782, "VISITOR PASS", Color.WHITE);
		text(canvas, REGULAR, 12, 49, 757, "Besucherpass", Color.WHITE);
		text(canvas, BOLD, 14, 49, 735, safe(pass.locationName()), Color.WHITE);
	}

	private void drawDetails(PDPageContentStream canvas, VisitPassData pass) throws IOException
	{
		text(canvas, BOLD, 11, 48, 675, "VISITOR");
		text(canvas, BOLD, 24, 48, 643, safe(pass.visitorName()));
		if (hasText(pass.visitorCompany()))
		{
			text(canvas, REGULAR, 12, 48, 620, safe(pass.visitorCompany()));
		}

		float y = 568;
		y = detail(canvas, "DATE", DATE.format(pass.visitDate()), y);
		y = detail(canvas, "HOST", valueOrDash(pass.hostName()), y);
		y = detail(canvas, "PURPOSE", valueOrDash(pass.purpose()), y);
		detail(canvas, "STATUS", safe(pass.status().replace('_', ' ')), y);

		text(canvas, BOLD, 10, 397, 488, "SCAN TO VERIFY");
		text(canvas, REGULAR, 8, 397, 474, "Admin authentication required");
	}

	private float detail(PDPageContentStream canvas, String label, String value, float y) throws IOException
	{
		text(canvas, BOLD, 9, 48, y, label);
		for (String line : wrap(safe(value), 46))
		{
			text(canvas, REGULAR, 12, 48, y - 18, line);
			y -= 15;
		}
		return y - 36;
	}

	private void drawQr(PDDocument document, PDPageContentStream canvas, String url) throws IOException
	{
		try
		{
			var matrix = new QRCodeWriter().encode(url, BarcodeFormat.QR_CODE, 360, 360,
				Map.of(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M,
					EncodeHintType.MARGIN, 1));
			BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
			ByteArrayOutputStream png = new ByteArrayOutputStream();
			ImageIO.write(image, "PNG", png);
			PDImageXObject qr = PDImageXObject.createFromByteArray(document, png.toByteArray(), "verification-qr");
			canvas.drawImage(qr, 397, 515, 150, 150);
		}
		catch (com.google.zxing.WriterException exception)
		{
			throw new IllegalStateException("Could not generate verification QR code", exception);
		}
	}

	private void drawFooter(PDPageContentStream canvas, VisitPassData pass) throws IOException
	{
		canvas.setStrokingColor(new Color(208, 216, 222));
		canvas.moveTo(48, 112);
		canvas.lineTo(547, 112);
		canvas.stroke();
		String address = String.join(" ", safe(pass.street()), safe(pass.postalCode()), safe(pass.city()), safe(pass.country()))
			.replaceAll("\\s+", " ").trim();
		text(canvas, BOLD, 9, 48, 91, safe(pass.locationName()));
		text(canvas, REGULAR, 9, 48, 75, address);
		if (hasText(pass.locationAdditionalInfo()))
		{
			text(canvas, REGULAR, 8, 48, 58, truncate(safe(pass.locationAdditionalInfo()), 92));
		}
		text(canvas, REGULAR, 7, 408, 58, "Pass ID: " + pass.visitId());
	}

	private void applyMetadata(PDDocument document, VisitPassData pass)
	{
		PDDocumentInformation information = new PDDocumentInformation();
		information.setTitle("Visitor pass - " + safe(pass.visitorName()));
		information.setSubject("Visitor pass " + pass.visitId());
		information.setCreator("EOS Visitor Management");
		document.setDocumentInformation(information);
	}

	private void text(PDPageContentStream canvas, PDFont font, float size, float x, float y, String value)
		throws IOException
	{
		text(canvas, font, size, x, y, value, new Color(25, 45, 64));
	}

	private void text(
		PDPageContentStream canvas, PDFont font, float size, float x, float y, String value, Color color)
		throws IOException
	{
		canvas.beginText();
		canvas.setFont(font, size);
		canvas.setNonStrokingColor(color);
		canvas.newLineAtOffset(x, y);
		canvas.showText(encodable(font, value));
		canvas.endText();
	}

	private String encodable(PDFont font, String value)
	{
		StringBuilder result = new StringBuilder();
		value.codePoints().forEach(codePoint -> {
			String character = new String(Character.toChars(codePoint));
			try
			{
				font.encode(character);
				result.append(character);
			}
			catch (IOException | IllegalArgumentException exception)
			{
				result.append('?');
			}
		});
		return result.toString();
	}

	private String[] wrap(String value, int width)
	{
		if (value.length() <= width)
		{
			return new String[] { value };
		}
		int breakAt = value.lastIndexOf(' ', width);
		if (breakAt < 1)
		{
			breakAt = width;
		}
		return new String[] { value.substring(0, breakAt), truncate(value.substring(breakAt).trim(), width) };
	}

	private String truncate(String value, int length)
	{
		return value.length() <= length ? value : value.substring(0, length - 3) + "...";
	}

	private String valueOrDash(String value)
	{
		return hasText(value) ? safe(value) : "-";
	}

	private String safe(String value)
	{
		return value == null ? "" : value.replaceAll("[\\r\\n\\t]+", " ").trim();
	}

	private boolean hasText(String value)
	{
		return value != null && !value.isBlank();
	}
}
