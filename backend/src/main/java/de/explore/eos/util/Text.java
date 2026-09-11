package de.explore.eos.util;

public final class Text
{
	private Text()
	{
	}

	public static String trimToNull(String value)
	{
		if (value == null)
		{
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
